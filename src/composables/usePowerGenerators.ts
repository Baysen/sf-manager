import { ref } from 'vue';
import type { SourceData, SourcePowerGenerator } from '../types/sourceData';
import rawSourceData from '../data/source-data.json';
import { useRecipes } from './useRecipes';

const data = rawSourceData as unknown as SourceData;

export interface PowerGenerator {
  name: string;
  key_name: string;
  category: string;
  base_power: number; // MW generated at 100%
  power_consumption: number; // MW consumed (usually 0)
  type: 'fuel' | 'geothermal';
  variable_power?: boolean;
  power_range?: [number, number]; // [min, max] for variable power
}

// Sort power generators alphabetically by name
const allPowerGenerators = ref<PowerGenerator[]>(
  (data.power_generators || [])
    .map((gen: SourcePowerGenerator) => ({
      ...gen,
      type: gen.type as 'fuel' | 'geothermal'
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
);

export function usePowerGenerators() {
  const { allRecipes } = useRecipes();

  const getGeneratorByKeyName = (keyName: string): PowerGenerator | undefined => {
    return allPowerGenerators.value.find(gen => gen.key_name === keyName);
  };

  // Get all recipes for a specific generator type (fuel-based only)
  const getRecipesForGenerator = (generatorKeyName: string) => {
    const generator = getGeneratorByKeyName(generatorKeyName);
    if (!generator || generator.type === 'geothermal') {
      return [];
    }

    // Find all recipes that match this generator's category
    return allRecipes.value.filter(recipe => recipe.machine === generator.name);
  };

  // Check if a generator is fuel-based (needs a recipe)
  const isFuelBased = (generatorKeyName: string): boolean => {
    const generator = getGeneratorByKeyName(generatorKeyName);
    return generator?.type === 'fuel';
  };

  // Check if a generator is geothermal (no fuel needed)
  const isGeothermal = (generatorKeyName: string): boolean => {
    const generator = getGeneratorByKeyName(generatorKeyName);
    return generator?.type === 'geothermal';
  };

  // Check if a generator has variable power output
  const hasVariablePower = (generatorKeyName: string): boolean => {
    const generator = getGeneratorByKeyName(generatorKeyName);
    return generator?.variable_power ?? false;
  };

  return {
    allPowerGenerators,
    getGeneratorByKeyName,
    getRecipesForGenerator,
    isFuelBased,
    isGeothermal,
    hasVariablePower
  };
}
