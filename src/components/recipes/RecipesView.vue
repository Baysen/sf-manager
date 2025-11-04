<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRecipes } from '../../composables/useRecipes';

const { recipes } = useRecipes();
const searchQuery = ref('');

const filteredRecipes = computed(() => {
  if (!searchQuery.value) return recipes.value;

  const query = searchQuery.value.toLowerCase();
  return recipes.value.filter(recipe =>
    recipe.name.toLowerCase().includes(query) ||
    recipe.machine.toLowerCase().includes(query)
  );
});
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search recipes..."
        class="w-full max-w-md px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        class="bg-gray-800 rounded-lg p-4 border border-gray-700"
      >
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold text-white">{{ recipe.name }}</h3>
          <span
            v-if="recipe.isAlternate"
            class="px-2 py-1 text-xs font-medium bg-purple-600 text-white rounded"
          >
            ALT
          </span>
        </div>

        <p class="text-sm text-gray-400 mb-3">{{ recipe.machine }}</p>

        <div class="space-y-3">
          <div>
            <div class="text-xs text-gray-400 mb-1">Inputs</div>
            <div class="space-y-1">
              <div v-for="input in recipe.inputs" :key="input.resource" class="text-sm">
                <span class="text-white">{{ input.resource }}:</span>
                <span class="text-red-400 ml-1">{{ input.amount }}/min</span>
              </div>
            </div>
          </div>

          <div>
            <div class="text-xs text-gray-400 mb-1">Outputs</div>
            <div class="space-y-1">
              <div v-for="output in recipe.outputs" :key="output.resource" class="text-sm">
                <span class="text-white">{{ output.resource }}:</span>
                <span class="text-green-400 ml-1">{{ output.amount }}/min</span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-gray-700">
            <div class="text-xs text-gray-400">Power Consumption</div>
            <div class="text-sm text-yellow-400 font-medium">{{ recipe.powerConsumption }} MW</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
