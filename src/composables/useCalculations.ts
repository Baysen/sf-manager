import type { Recipe } from '../types/recipe';
import type { ProductionLine, ResourceBalance, PowerBreakdown, ResourceExtractionLine } from '../types/location';
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
    extractionLines: ResourceExtractionLine[] = []
  ): ResourceBalance[] => {
    const resourceMap = new Map<string, { production: number; consumption: number }>();

    // Add resource extraction (production only)
    for (const line of extractionLines) {
      const miner = getMinerByKeyName(line.minerType);
      const resource = getResourceByKeyName(line.resourceType);
      if (!miner || !resource) continue;

      const current = resourceMap.get(resource.name) || { production: 0, consumption: 0 };
      current.production += calculateExtractionRate(miner, line);
      resourceMap.set(resource.name, current);
    }

    // Add production lines
    for (const line of productionLines) {
      const recipe = recipes.find(r => r.id === line.recipeId);
      if (!recipe) continue;

      // Add outputs (production)
      for (const output of recipe.outputs) {
        const current = resourceMap.get(output.resource) || { production: 0, consumption: 0 };
        current.production += calculateProductionRate(recipe, line, output.resource, false);
        resourceMap.set(output.resource, current);
      }

      // Add inputs (consumption)
      for (const input of recipe.inputs) {
        const current = resourceMap.get(input.resource) || { production: 0, consumption: 0 };
        current.consumption += calculateProductionRate(recipe, line, input.resource, true);
        resourceMap.set(input.resource, current);
      }
    }

    return Array.from(resourceMap.entries()).map(([resource, data]) => {
      const balance = data.production - data.consumption;
      let status: 'surplus' | 'balanced' | 'deficit';
      if (balance > 0.1) status = 'surplus';
      else if (balance < -0.1) status = 'deficit';
      else status = 'balanced';

      return {
        resource,
        production: data.production,
        consumption: data.consumption,
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
