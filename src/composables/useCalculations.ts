import type { Recipe } from '../types/recipe';
import type { ProductionLine, ResourceBalance, PowerBreakdown, ResourceExtractionLine, Location, ImportDetail, ExportDetail } from '../types/location';
import { useMiners, PURITY_MULTIPLIERS, type Miner } from './useMiners';

export function useCalculations() {
  const { getMinerByKeyName, getResourceByKeyName } = useMiners();

  const calculateExtractionRate = (
    miner: Miner,
    extractionLine: ResourceExtractionLine
  ): number => {
    const purityMultiplier = PURITY_MULTIPLIERS[extractionLine.purity];
    let totalRate = 0;

    for (const overclock of extractionLine.overclocking) {
      const speedMultiplier = overclock.percentage / 100;
      totalRate += miner.base_rate * purityMultiplier * overclock.count * speedMultiplier;
    }

    return totalRate;
  };

  const calculateExtractionPower = (
    miner: Miner,
    extractionLine: ResourceExtractionLine
  ): number => {
    let totalPower = 0;

    for (const overclock of extractionLine.overclocking) {
      const speedMultiplier = overclock.percentage / 100;
      const powerMultiplier = Math.pow(speedMultiplier, 1.6);
      totalPower += miner.power * overclock.count * powerMultiplier;
    }

    return totalPower;
  };
  const calculateProductionRate = (
    recipe: Recipe,
    productionLine: ProductionLine,
    resourceName: string,
    isInput: boolean
  ): number => {
    const resources = isInput ? recipe.inputs : recipe.outputs;
    const baseRate = resources.find(r => r.resource === resourceName)?.amount || 0;

    let totalRate = 0;
    for (const overclock of productionLine.overclocking) {
      const speedMultiplier = overclock.percentage / 100;
      totalRate += baseRate * overclock.count * speedMultiplier;
    }

    return totalRate;
  };

  const calculatePowerConsumption = (
    recipe: Recipe,
    productionLine: ProductionLine
  ): number => {
    let totalPower = 0;
    for (const overclock of productionLine.overclocking) {
      const speedMultiplier = overclock.percentage / 100;
      const powerMultiplier = Math.pow(speedMultiplier, 1.6);
      totalPower += recipe.powerConsumption * overclock.count * powerMultiplier;
    }
    return totalPower;
  };

  const calculateResourceBalances = (
    productionLines: ProductionLine[],
    recipes: Recipe[],
    extractionLines: ResourceExtractionLine[] = [],
    currentLocation?: Location,
    allLocations?: Location[]
  ): ResourceBalance[] => {
    const resourceMap = new Map<string, {
      production: number;
      consumption: number;
      imports: ImportDetail[];
      exports: ExportDetail[];
    }>();

    // Add resource extraction (production only)
    for (const line of extractionLines) {
      const miner = getMinerByKeyName(line.minerType);
      const resource = getResourceByKeyName(line.resourceType);
      if (!miner || !resource) continue;

      const current = resourceMap.get(resource.name) || { production: 0, consumption: 0, imports: [], exports: [] };
      current.production += calculateExtractionRate(miner, line);
      resourceMap.set(resource.name, current);
    }

    // Add production lines
    for (const line of productionLines) {
      const recipe = recipes.find(r => r.id === line.recipeId);
      if (!recipe) continue;

      // Add outputs (production)
      for (const output of recipe.outputs) {
        const current = resourceMap.get(output.resource) || { production: 0, consumption: 0, imports: [], exports: [] };
        current.production += calculateProductionRate(recipe, line, output.resource, false);
        resourceMap.set(output.resource, current);
      }

      // Add inputs (consumption)
      for (const input of recipe.inputs) {
        const current = resourceMap.get(input.resource) || { production: 0, consumption: 0, imports: [], exports: [] };
        current.consumption += calculateProductionRate(recipe, line, input.resource, true);
        resourceMap.set(input.resource, current);
      }
    }

    // Calculate imports (from other locations' exports to this location)
    if (currentLocation && allLocations) {
      for (const otherLocation of allLocations) {
        if (otherLocation.id === currentLocation.id) continue;

        for (const exportConfig of otherLocation.exports) {
          if (exportConfig.toLocationId !== currentLocation.id) continue;

          // Calculate local production and consumption at source location (without recursion)
          const sourceResourceMap = new Map<string, { production: number; consumption: number }>();

          // Add source extraction
          for (const line of otherLocation.resourceExtractionLines) {
            const miner = getMinerByKeyName(line.minerType);
            const resource = getResourceByKeyName(line.resourceType);
            if (!miner || !resource) continue;
            const current = sourceResourceMap.get(resource.name) || { production: 0, consumption: 0 };
            current.production += calculateExtractionRate(miner, line);
            sourceResourceMap.set(resource.name, current);
          }

          // Add source production lines
          for (const line of otherLocation.productionLines) {
            const recipe = recipes.find(r => r.id === line.recipeId);
            if (!recipe) continue;
            for (const output of recipe.outputs) {
              const current = sourceResourceMap.get(output.resource) || { production: 0, consumption: 0 };
              current.production += calculateProductionRate(recipe, line, output.resource, false);
              sourceResourceMap.set(output.resource, current);
            }
            for (const input of recipe.inputs) {
              const current = sourceResourceMap.get(input.resource) || { production: 0, consumption: 0 };
              current.consumption += calculateProductionRate(recipe, line, input.resource, true);
              sourceResourceMap.set(input.resource, current);
            }
          }

          const sourceData = sourceResourceMap.get(exportConfig.resource);
          if (!sourceData) continue;

          const availableSurplus = sourceData.production - sourceData.consumption;

          let exportAmount = 0;
          if (exportConfig.mode === 'percentage') {
            exportAmount = (availableSurplus * exportConfig.value) / 100;
          } else {
            exportAmount = exportConfig.value;
          }

          // Add to imports
          const current = resourceMap.get(exportConfig.resource) || { production: 0, consumption: 0, imports: [], exports: [] };
          current.imports.push({
            fromLocationId: otherLocation.id,
            fromLocationName: otherLocation.name,
            amount: exportAmount
          });
          resourceMap.set(exportConfig.resource, current);
        }
      }
    }

    // Calculate exports (from this location to others)
    if (currentLocation) {
      for (const exportConfig of currentLocation.exports) {
        // Get available surplus (production + imports - consumption)
        const current = resourceMap.get(exportConfig.resource);
        if (!current) continue;

        const totalImports = current.imports.reduce((sum, imp) => sum + imp.amount, 0);
        const availableSurplus = current.production + totalImports - current.consumption;

        let exportAmount = 0;
        if (exportConfig.mode === 'percentage') {
          exportAmount = (availableSurplus * exportConfig.value) / 100;
        } else {
          exportAmount = exportConfig.value;
        }

        const destinationLocation = allLocations?.find(l => l.id === exportConfig.toLocationId);
        current.exports.push({
          toLocationId: exportConfig.toLocationId,
          toLocationName: destinationLocation?.name || 'Unknown',
          amount: exportAmount
        });
      }
    }

    return Array.from(resourceMap.entries()).map(([resource, data]) => {
      const totalImports = data.imports.reduce((sum, imp) => sum + imp.amount, 0);
      const totalExports = data.exports.reduce((sum, exp) => sum + exp.amount, 0);
      const balance = data.production + totalImports - data.consumption - totalExports;

      let status: 'surplus' | 'balanced' | 'deficit';
      if (balance > 0.1) status = 'surplus';
      else if (balance < -0.1) status = 'deficit';
      else status = 'balanced';

      return {
        resource,
        production: data.production,
        consumption: data.consumption,
        imports: data.imports,
        exports: data.exports,
        balance,
        status
      };
    });
  };

  const calculatePowerBreakdown = (
    productionLines: ProductionLine[],
    recipes: Recipe[],
    extractionLines: ResourceExtractionLine[] = []
  ): PowerBreakdown[] => {
    const powerMap = new Map<string, number>();

    // Add extraction line power
    for (const line of extractionLines) {
      const miner = getMinerByKeyName(line.minerType);
      if (!miner) continue;

      const power = calculateExtractionPower(miner, line);
      const current = powerMap.get(miner.name) || 0;
      powerMap.set(miner.name, current + power);
    }

    // Add production line power
    for (const line of productionLines) {
      const recipe = recipes.find(r => r.id === line.recipeId);
      if (!recipe) continue;

      const power = calculatePowerConsumption(recipe, line);
      const current = powerMap.get(recipe.machine) || 0;
      powerMap.set(recipe.machine, current + power);
    }

    return Array.from(powerMap.entries()).map(([machineType, consumption]) => ({
      machineType,
      consumption
    }));
  };

  return {
    calculateProductionRate,
    calculatePowerConsumption,
    calculateExtractionRate,
    calculateExtractionPower,
    calculateResourceBalances,
    calculatePowerBreakdown
  };
}
