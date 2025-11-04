import { ref } from 'vue';
import type { Recipe } from '../types/recipe';

const recipes = ref<Recipe[]>([]);

export function useRecipes() {
  const loadRecipes = async () => {
    // TODO: Load from recipes.json file when available
    // For now, initialize with empty array
    if (recipes.value.length === 0) {
      recipes.value = [];
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
