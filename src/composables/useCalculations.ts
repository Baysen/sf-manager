import type { Recipe } from '../types/recipe';
import type { ProductionLine, ResourceBalance, PowerBreakdown, PowerSummary, ResourceExtractionLine, PowerGenerationLine, Location, ImportDetail, ExportDetail } from '../types/location';
import { useMiners, PURITY_MULTIPLIERS, type Miner } from './useMiners';
import { usePowerGenerators, type PowerGenerator } from './usePowerGenerators';

/**
 * Calculate the production multiplier from somersloops
 * Somersloops always provide up to 2x production when maxed
 * Each somersloop adds (1.0 / maxSomersloops) to the multiplier
 * @param somersloopCount - Number of somersloops installed
 * @param maxSomersloops - Maximum somersloops this machine can hold
 * @returns Production multiplier (1.0 to 2.0)
 */
export function calculateSomersloopProductionMultiplier(
  somersloopCount: number,
  maxSomersloops: number | null
): number {
  if (!maxSomersloops || somersloopCount <= 0) return 1.0;
  const clampedCount = Math.min(somersloopCount, maxSomersloops);
  return 1.0 + (clampedCount / maxSomersloops);
}

/**
 * Calculate the power multiplier from somersloops
 * Each somersloop doubles the power consumption
 * @param somersloopCount - Number of somersloops installed
 * @returns Power multiplier (2^somersloopCount)
 */
export function calculateSomersloopPowerMultiplier(
  somersloopCount: number
): number {
  if (somersloopCount <= 0) return 1.0;
  return Math.pow(2, somersloopCount);
}

export function useCalculations() {
  const { getMinerByKeyName, getResourceByKeyName } = useMiners();
  const { getGeneratorByKeyName } = usePowerGenerators();

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

  const calculatePowerGeneration = (
    generator: PowerGenerator,
    powerLine: PowerGenerationLine
  ): number => {
    let totalPower = 0;

    // For geothermal with variable power, use actualPower if provided
    if (generator.type === 'geothermal' && generator.variable_power && powerLine.actualPower) {
      for (const overclock of powerLine.overclocking) {
        const speedMultiplier = overclock.percentage / 100;
        totalPower += powerLine.actualPower * overclock.count * speedMultiplier;
      }
    } else {
      // Normal power generation (fuel-based or geothermal with fixed power)
      for (const overclock of powerLine.overclocking) {
        const speedMultiplier = overclock.percentage / 100;
        totalPower += generator.base_power * overclock.count * speedMultiplier;
      }
    }

    return totalPower;
  };

  const calculateGeneratorPowerConsumption = (
    generator: PowerGenerator,
    powerLine: PowerGenerationLine
  ): number => {
    // Most generators don't consume power, but included for completeness
    if (generator.power_consumption === 0) return 0;

    let totalPower = 0;
    for (const overclock of powerLine.overclocking) {
      const speedMultiplier = overclock.percentage / 100;
      const powerMultiplier = Math.pow(speedMultiplier, 1.6);
      totalPower += generator.power_consumption * overclock.count * powerMultiplier;
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

      // Calculate somersloop multiplier for this config (only affects outputs, not inputs)
      const somersloopMultiplier = !isInput
        ? calculateSomersloopProductionMultiplier(overclock.somersloops || 0, recipe.somersloopSlots)
        : 1.0;

      totalRate += baseRate * overclock.count * speedMultiplier * somersloopMultiplier;
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

      // Calculate somersloop power multiplier for this config (each somersloop doubles power)
      const somersloopPowerMultiplier = calculateSomersloopPowerMultiplier(overclock.somersloops || 0);

      totalPower += recipe.powerConsumption * overclock.count * powerMultiplier * somersloopPowerMultiplier;
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

    // Add power generation lines (fuel consumption and waste production)
    if (currentLocation?.powerGenerationLines) {
      for (const line of currentLocation.powerGenerationLines) {
        if (!line.recipeId) continue; // Skip geothermal (no fuel)

        const recipe = recipes.find(r => r.id === line.recipeId);
        if (!recipe) continue;

        // Add fuel consumption
        for (const input of recipe.inputs) {
          const current = resourceMap.get(input.resource) || { production: 0, consumption: 0, imports: [], exports: [] };
          current.consumption += calculateProductionRate(recipe, line as unknown as ProductionLine, input.resource, true);
          resourceMap.set(input.resource, current);
        }

        // Add waste production (e.g., uranium waste from nuclear)
        for (const output of recipe.outputs) {
          const current = resourceMap.get(output.resource) || { production: 0, consumption: 0, imports: [], exports: [] };
          current.production += calculateProductionRate(recipe, line as unknown as ProductionLine, output.resource, false);
          resourceMap.set(output.resource, current);
        }
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

  const calculatePowerSummary = (
    productionLines: ProductionLine[],
    recipes: Recipe[],
    extractionLines: ResourceExtractionLine[] = [],
    powerGenerationLines: PowerGenerationLine[] = []
  ): PowerSummary => {
    const consumptionMap = new Map<string, number>();
    const generationMap = new Map<string, number>();

    // Calculate power consumption from extraction lines
    for (const line of extractionLines) {
      const miner = getMinerByKeyName(line.minerType);
      if (!miner) continue;

      const power = calculateExtractionPower(miner, line);
      const current = consumptionMap.get(miner.name) || 0;
      consumptionMap.set(miner.name, current + power);
    }

    // Calculate power consumption from production lines
    for (const line of productionLines) {
      const recipe = recipes.find(r => r.id === line.recipeId);
      if (!recipe) continue;

      const power = calculatePowerConsumption(recipe, line);
      const current = consumptionMap.get(recipe.machine) || 0;
      consumptionMap.set(recipe.machine, current + power);
    }

    // Calculate power generation
    for (const line of powerGenerationLines) {
      const generator = getGeneratorByKeyName(line.generatorType);
      if (!generator) continue;

      const power = calculatePowerGeneration(generator, line);
      const current = generationMap.get(generator.name) || 0;
      generationMap.set(generator.name, current + power);

      // Add generator's own power consumption if any
      const genConsumption = calculateGeneratorPowerConsumption(generator, line);
      if (genConsumption > 0) {
        const currentConsumption = consumptionMap.get(generator.name) || 0;
        consumptionMap.set(generator.name, currentConsumption + genConsumption);
      }
    }

    const consumptionBreakdown = Array.from(consumptionMap.entries()).map(([machineType, consumption]) => ({
      machineType,
      consumption
    }));

    const generationBreakdown = Array.from(generationMap.entries()).map(([machineType, consumption]) => ({
      machineType,
      consumption
    }));

    const totalConsumption = consumptionBreakdown.reduce((sum, item) => sum + item.consumption, 0);
    const totalGeneration = generationBreakdown.reduce((sum, item) => sum + item.consumption, 0);

    return {
      totalGeneration,
      totalConsumption,
      netPower: totalGeneration - totalConsumption,
      generationBreakdown,
      consumptionBreakdown
    };
  };

  return {
    calculateProductionRate,
    calculatePowerConsumption,
    calculateExtractionRate,
    calculateExtractionPower,
    calculatePowerGeneration,
    calculateGeneratorPowerConsumption,
    calculateResourceBalances,
    calculatePowerBreakdown,
    calculatePowerSummary
  };
}
