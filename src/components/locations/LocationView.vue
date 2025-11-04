<script setup lang="ts">
import { computed } from 'vue';
import { useLocations } from '../../composables/useLocations';
import { useRecipes } from '../../composables/useRecipes';
import { useCalculations } from '../../composables/useCalculations';
import ProductionLineCard from './ProductionLineCard.vue';
import ResourceSummary from './ResourceSummary.vue';
import PowerSummary from './PowerSummary.vue';

const { activeLocation, deleteProductionLine } = useLocations();
const { allRecipes, getRecipeById } = useRecipes();
const { calculateResourceBalances, calculatePowerBreakdown } = useCalculations();

// Filter production lines to only show those with valid recipes
const validProductionLines = computed(() => {
  if (!activeLocation.value) return [];
  return activeLocation.value.productionLines.filter(line => getRecipeById(line.recipeId));
});

const resourceBalances = computed(() => {
  if (!activeLocation.value) return [];
  return calculateResourceBalances(activeLocation.value.productionLines, allRecipes.value);
});

const powerBreakdown = computed(() => {
  if (!activeLocation.value) return [];
  return calculatePowerBreakdown(activeLocation.value.productionLines, allRecipes.value);
});

const handleEdit = (lineId: string) => {
  // TODO: Implement edit modal
  console.log('Edit line:', lineId);
};

const handleDelete = (lineId: string) => {
  if (!activeLocation.value) return;
  if (confirm('Are you sure you want to delete this production line?')) {
    deleteProductionLine(activeLocation.value.id, lineId);
  }
};

const handleAddProductionLine = () => {
  // TODO: Implement add modal
  console.log('Add production line');
};
</script>

<template>
  <div v-if="!activeLocation" class="flex items-center justify-center h-96">
    <p class="text-gray-400">No location selected</p>
  </div>

  <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
    <!-- Left Panel (Production Lines) -->
    <div class="lg:col-span-2 space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-white">Production Lines</h2>
        <button
          @click="handleAddProductionLine"
          class="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          + Add Production Line
        </button>
      </div>

      <div v-if="activeLocation.productionLines.length === 0" class="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
        <p class="text-gray-400">No production lines yet. Add one to get started!</p>
      </div>

      <div v-else class="space-y-4">
        <ProductionLineCard
          v-for="line in validProductionLines"
          :key="line.id"
          :production-line="line"
          :recipe="getRecipeById(line.recipeId)!"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- Right Panel (Summaries) -->
    <div class="space-y-4">
      <ResourceSummary :balances="resourceBalances" />
      <PowerSummary :breakdown="powerBreakdown" />
    </div>
  </div>
</template>
