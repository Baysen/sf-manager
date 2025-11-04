import { ref } from 'vue';
import type { Recipe } from '../types/recipe';

const recipes = ref<Recipe[]>([]);

export function useRecipes() {
  const loadRecipes = () => {
    // TODO: Load from recipes.json file
    // For now, using sample data - only initialize if not already loaded
    if (recipes.value.length === 0) {
      recipes.value = [
        {
          id: 'iron-ingot',
          name: 'Iron Ingot',
          machine: 'Smelter',
          isAlternate: false,
          inputs: [{ resource: 'Iron Ore', amount: 30 }],
          outputs: [{ resource: 'Iron Ingot', amount: 30 }],
          powerConsumption: 4
        },
        {
          id: 'iron-plate',
          name: 'Iron Plate',
          machine: 'Constructor',
          isAlternate: false,
          inputs: [{ resource: 'Iron Ingot', amount: 30 }],
          outputs: [{ resource: 'Iron Plate', amount: 20 }],
          powerConsumption: 4
        },
        {
          id: 'iron-rod',
          name: 'Iron Rod',
          machine: 'Constructor',
          isAlternate: false,
          inputs: [{ resource: 'Iron Ingot', amount: 15 }],
          outputs: [{ resource: 'Iron Rod', amount: 15 }],
          powerConsumption: 4
        }
      ];
    }
  };

  const getRecipeById = (id: string): Recipe | undefined => {
    return recipes.value.find(r => r.id === id);
  };

  const getRecipesByMachine = (machine: string): Recipe[] => {
    return recipes.value.filter(r => r.machine === machine);
  };

  const searchRecipes = (query: string): Recipe[] => {
    const lowerQuery = query.toLowerCase();
    return recipes.value.filter(r =>
      r.name.toLowerCase().includes(lowerQuery) ||
      r.machine.toLowerCase().includes(lowerQuery)
    );
  };

  return {
    recipes,
    loadRecipes,
    getRecipeById,
    getRecipesByMachine,
    searchRecipes
  };
}
