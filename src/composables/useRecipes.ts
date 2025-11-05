import { ref, computed } from 'vue';
import type { Recipe } from '../types/recipe';
import type { SourceData, SourceRecipe, SourceBuilding } from '../types/sourceData';
import rawSourceData from '../data/source-data.json';

const data = rawSourceData as unknown as SourceData;

// Create a map of category to building
const categoryToBuildingMap = new Map<string, SourceBuilding>();
data.buildings.forEach(building => {
  categoryToBuildingMap.set(building.category, building);
});

// Also add miners to the map
data.miners.forEach(miner => {
  categoryToBuildingMap.set(miner.category, {
    name: miner.name,
    key_name: miner.key_name,
    category: miner.category,
    power: miner.power,
    somersloop_slots: null,
    max: 1
  });
});

// Create a map of item/fluid keys to names
const resourceNameMap = new Map<string, string>();
data.items.forEach(item => {
  resourceNameMap.set(item.key_name, item.name);
});
data.fluids.forEach(fluid => {
  resourceNameMap.set(fluid.key_name, fluid.name);
});

/**
 * Transform a source recipe to our internal Recipe format
 * Converts rates from "per craft" to "per minute"
 */
function transformRecipe(sourceRecipe: SourceRecipe): Recipe {
  const building = categoryToBuildingMap.get(sourceRecipe.category);
  const isAlternate = sourceRecipe.name.startsWith('Alternate:');

  // Calculate items per minute (60 seconds per minute / craft time)
  const craftsPerMinute = 60 / sourceRecipe.time;

  // Remove "Alternate: " prefix from the name if present
  const displayName = isAlternate
    ? sourceRecipe.name.replace('Alternate: ', '')
    : sourceRecipe.name;

  const inputs = sourceRecipe.ingredients.map(([itemKey, amount]) => ({
    resource: resourceNameMap.get(itemKey) || itemKey,
    amount: amount * craftsPerMinute // Convert to per minute
  }))

  const outputs = sourceRecipe.products.map(([itemKey, amount]) => ({
    resource: resourceNameMap.get(itemKey) || itemKey,
    amount: amount * craftsPerMinute // Convert to per minute
  }));

  return {
    id: sourceRecipe.key_name,
    name: displayName,
    baseName: isAlternate && outputs.length > 0 ? outputs[0]?.resource : undefined,
    machine: building?.name || sourceRecipe.category,
    isAlternate,
    inputs,
    outputs,
    powerConsumption: building?.power || 0 // MW at 100% clock speed
  };
}

// Transform all recipes
const allRecipes = ref<Recipe[]>(
  data.recipes.map(transformRecipe)
);

export function useRecipes() {
  const searchQuery = ref('');
  const machineFilter = ref<string>('');
  const alternateFilter = ref<'all' | 'standard' | 'alternate'>('all');

  // Get unique machine types for filtering
  const machineTypes = computed(() => {
    const types = new Set(allRecipes.value.map(r => r.machine));
    return Array.from(types).sort();
  });

  // Filtered recipes based on search and filters
  const filteredRecipes = computed(() => {
    let recipes = allRecipes.value;

    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      recipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(query) ||
        recipe.inputs.some(input => input.resource.toLowerCase().includes(query)) ||
        recipe.outputs.some(output => output.resource.toLowerCase().includes(query))
      );
    }

    // Machine type filter
    if (machineFilter.value) {
      recipes = recipes.filter(recipe => recipe.machine === machineFilter.value);
    }

    // Alternate filter
    if (alternateFilter.value !== 'all') {
      const isAlternateRequired = alternateFilter.value === 'alternate';
      recipes = recipes.filter(recipe => recipe.isAlternate === isAlternateRequired);
    }

    return recipes;
  });

  // Get recipe by ID
  const getRecipeById = (id: string): Recipe | undefined => {
    return allRecipes.value.find(recipe => recipe.id === id);
  };

  return {
    allRecipes,
    filteredRecipes,
    searchQuery,
    machineFilter,
    alternateFilter,
    machineTypes,
    getRecipeById
  };
}
