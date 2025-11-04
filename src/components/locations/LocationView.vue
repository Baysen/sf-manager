<script setup lang="ts">
import { computed, ref } from 'vue';
import { useLocations } from '../../composables/useLocations';
import { useRecipes } from '../../composables/useRecipes';
import { useMiners } from '../../composables/useMiners';
import { useCalculations } from '../../composables/useCalculations';
import type { ProductionLine, ResourceExtractionLine } from '../../types/location';
import ResourceExtractionCard from './ResourceExtractionCard.vue';
import ResourceExtractionModal from './ResourceExtractionModal.vue';
import ProductionLineCard from './ProductionLineCard.vue';
import ProductionLineModal from './ProductionLineModal.vue';
import ResourceSummary from './ResourceSummary.vue';
import PowerSummary from './PowerSummary.vue';

const { activeLocation, addProductionLine, updateProductionLine, deleteProductionLine, addResourceExtractionLine, updateResourceExtractionLine, deleteResourceExtractionLine } = useLocations();
const { allRecipes, getRecipeById } = useRecipes();
const { getMinerByKeyName, getResourceByKeyName } = useMiners();
const { calculateResourceBalances, calculatePowerBreakdown } = useCalculations();

// Production line modal state
const isModalOpen = ref(false);
const editingProductionLine = ref<ProductionLine | null>(null);

// Resource extraction modal state
const isExtractionModalOpen = ref(false);
const editingExtractionLine = ref<ResourceExtractionLine | null>(null);

// Filter production lines to only show those with valid recipes
const validProductionLines = computed(() => {
  if (!activeLocation.value) return [];
  return activeLocation.value.productionLines.filter(line => getRecipeById(line.recipeId));
});

// Filter extraction lines to only show those with valid miners
const validExtractionLines = computed(() => {
  if (!activeLocation.value) return [];
  return activeLocation.value.resourceExtractionLines.filter(line =>
    getMinerByKeyName(line.minerType) && getResourceByKeyName(line.resourceType)
  );
});

const resourceBalances = computed(() => {
  if (!activeLocation.value) return [];
  return calculateResourceBalances(
    activeLocation.value.productionLines,
    allRecipes.value,
    activeLocation.value.resourceExtractionLines
  );
});

const powerBreakdown = computed(() => {
  if (!activeLocation.value) return [];
  return calculatePowerBreakdown(
    activeLocation.value.productionLines,
    allRecipes.value,
    activeLocation.value.resourceExtractionLines
  );
});

const handleEdit = (lineId: string) => {
  if (!activeLocation.value) return;
  const line = activeLocation.value.productionLines.find(l => l.id === lineId);
  if (line) {
    editingProductionLine.value = line;
    isModalOpen.value = true;
  }
};

const handleDelete = (lineId: string) => {
  if (!activeLocation.value) return;
  if (confirm('Are you sure you want to delete this production line?')) {
    deleteProductionLine(activeLocation.value.id, lineId);
  }
};

const handleAddProductionLine = () => {
  editingProductionLine.value = null;
  isModalOpen.value = true;
};

const handleModalClose = () => {
  isModalOpen.value = false;
  editingProductionLine.value = null;
};

const handleModalSave = (line: Omit<ProductionLine, 'id'>) => {
  if (!activeLocation.value) return;

  if (editingProductionLine.value) {
    // Update existing production line
    updateProductionLine(activeLocation.value.id, editingProductionLine.value.id, line);
  } else {
    // Add new production line
    addProductionLine(activeLocation.value.id, line);
  }
};

// Resource extraction handlers
const handleEditExtraction = (lineId: string) => {
  if (!activeLocation.value) return;
  const line = activeLocation.value.resourceExtractionLines.find(l => l.id === lineId);
  if (line) {
    editingExtractionLine.value = line;
    isExtractionModalOpen.value = true;
  }
};

const handleDeleteExtraction = (lineId: string) => {
  if (!activeLocation.value) return;
  if (confirm('Are you sure you want to delete this extraction line?')) {
    deleteResourceExtractionLine(activeLocation.value.id, lineId);
  }
};

const handleAddExtraction = () => {
  editingExtractionLine.value = null;
  isExtractionModalOpen.value = true;
};

const handleExtractionModalClose = () => {
  isExtractionModalOpen.value = false;
  editingExtractionLine.value = null;
};

const handleExtractionModalSave = (line: Omit<ResourceExtractionLine, 'id'>) => {
  if (!activeLocation.value) return;

  if (editingExtractionLine.value) {
    // Update existing extraction line
    updateResourceExtractionLine(activeLocation.value.id, editingExtractionLine.value.id, line);
  } else {
    // Add new extraction line
    addResourceExtractionLine(activeLocation.value.id, line);
  }
};
</script>

<template>
  <div v-if="!activeLocation" class="flex items-center justify-center h-96">
    <p class="text-gray-400">No location selected</p>
  </div>

  <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
    <!-- Left Panel (Resource Extraction & Production Lines) -->
    <div class="lg:col-span-2 space-y-8">
      <!-- Resource Extraction Section -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-white">Resource Extraction</h2>
          <button
            @click="handleAddExtraction"
            class="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            + Add Extraction Line
          </button>
        </div>

        <div v-if="activeLocation.resourceExtractionLines.length === 0" class="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
          <p class="text-gray-400">No resource extraction lines yet. Add miners, oil extractors, or water extractors!</p>
        </div>

        <div v-else class="space-y-4">
          <ResourceExtractionCard
            v-for="line in validExtractionLines"
            :key="line.id"
            :extraction-line="line"
            :miner="getMinerByKeyName(line.minerType)!"
            :resource="getResourceByKeyName(line.resourceType)!"
            @edit="handleEditExtraction"
            @delete="handleDeleteExtraction"
          />
        </div>
      </div>

      <!-- Production Lines Section -->
      <div class="space-y-4">
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
    </div>

    <!-- Right Panel (Summaries) -->
    <div class="space-y-4">
      <ResourceSummary :balances="resourceBalances" />
      <PowerSummary :breakdown="powerBreakdown" />
    </div>

    <!-- Resource Extraction Modal -->
    <ResourceExtractionModal
      :is-open="isExtractionModalOpen"
      :extraction-line="editingExtractionLine"
      @close="handleExtractionModalClose"
      @save="handleExtractionModalSave"
    />

    <!-- Production Line Modal -->
    <ProductionLineModal
      :is-open="isModalOpen"
      :production-line="editingProductionLine"
      @close="handleModalClose"
      @save="handleModalSave"
    />
  </div>
</template>
