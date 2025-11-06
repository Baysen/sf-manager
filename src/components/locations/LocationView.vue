<script setup lang="ts">
import { computed, ref } from 'vue';
import { useLocations } from '../../composables/useLocations';
import { useRecipes } from '../../composables/useRecipes';
import { useMiners } from '../../composables/useMiners';
import { usePowerGenerators } from '../../composables/usePowerGenerators';
import { useCalculations } from '../../composables/useCalculations';
import type { ProductionLine, ResourceExtractionLine, PowerGenerationLine, ResourceExport } from '../../types/location';
import ResourceExtractionCard from './ResourceExtractionCard.vue';
import ResourceExtractionModal from './ResourceExtractionModal.vue';
import ProductionLineCard from './ProductionLineCard.vue';
import ProductionLineModal from './ProductionLineModal.vue';
import PowerGenerationCard from './PowerGenerationCard.vue';
import PowerGenerationModal from './PowerGenerationModal.vue';
import ResourceExportCard from './ResourceExportCard.vue';
import ResourceExportModal from './ResourceExportModal.vue';
import ResourceSummary from './ResourceSummary.vue';
import PowerSummary from './PowerSummary.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-vue-next';

const { locations, activeLocation, addProductionLine, updateProductionLine, deleteProductionLine, addResourceExtractionLine, updateResourceExtractionLine, deleteResourceExtractionLine, addPowerGenerationLine, updatePowerGenerationLine, deletePowerGenerationLine, addResourceExport, updateResourceExport, deleteResourceExport } = useLocations();
const { allRecipes, getRecipeById } = useRecipes();
const { getMinerByKeyName, getResourceByKeyName } = useMiners();
const { getGeneratorByKeyName } = usePowerGenerators();
const { calculateResourceBalances, calculatePowerSummary } = useCalculations();

// Production line modal state
const isModalOpen = ref(false);
const editingProductionLine = ref<ProductionLine | null>(null);

// Resource extraction modal state
const isExtractionModalOpen = ref(false);
const editingExtractionLine = ref<ResourceExtractionLine | null>(null);

// Power generation modal state
const isPowerGenerationModalOpen = ref(false);
const editingPowerLine = ref<PowerGenerationLine | null>(null);

// Resource export modal state
const isExportModalOpen = ref(false);
const editingExport = ref<ResourceExport | null>(null);

// Filter production lines to only show those with valid recipes, sorted alphabetically by recipe name
// For alternate recipes, sort by baseName (the output resource) instead of the alternate name
const validProductionLines = computed(() => {
  if (!activeLocation.value) return [];
  return activeLocation.value.productionLines
    .filter(line => getRecipeById(line.recipeId))
    .sort((a, b) => {
      const recipeA = getRecipeById(a.recipeId);
      const recipeB = getRecipeById(b.recipeId);
      const nameA = recipeA?.baseName || recipeA?.name || '';
      const nameB = recipeB?.baseName || recipeB?.name || '';
      return nameA.localeCompare(nameB);
    });
});

// Filter extraction lines to only show those with valid miners, sorted alphabetically by resource name
const validExtractionLines = computed(() => {
  if (!activeLocation.value) return [];
  return activeLocation.value.resourceExtractionLines
    .filter(line => getMinerByKeyName(line.minerType) && getResourceByKeyName(line.resourceType))
    .sort((a, b) => {
      const resourceA = getResourceByKeyName(a.resourceType)?.name || '';
      const resourceB = getResourceByKeyName(b.resourceType)?.name || '';
      return resourceA.localeCompare(resourceB);
    });
});

// Filter power generation lines to only show those with valid generators, sorted alphabetically by generator name
const validPowerGenerationLines = computed(() => {
  if (!activeLocation.value) return [];
  return activeLocation.value.powerGenerationLines
    .filter(line => getGeneratorByKeyName(line.generatorType))
    .sort((a, b) => {
      const generatorA = getGeneratorByKeyName(a.generatorType)?.name || '';
      const generatorB = getGeneratorByKeyName(b.generatorType)?.name || '';
      return generatorA.localeCompare(generatorB);
    });
});

const resourceBalances = computed(() => {
  if (!activeLocation.value) return [];
  return calculateResourceBalances(
    activeLocation.value.productionLines,
    allRecipes.value,
    activeLocation.value.resourceExtractionLines,
    activeLocation.value,
    locations.value
  );
});

const powerSummary = computed(() => {
  if (!activeLocation.value) return {
    totalGeneration: 0,
    localGeneration: 0,
    globalGridGeneration: 0,
    totalConsumption: 0,
    netPower: 0,
    generationBreakdown: [],
    consumptionBreakdown: []
  };
  return calculatePowerSummary(
    activeLocation.value.productionLines,
    allRecipes.value,
    activeLocation.value.resourceExtractionLines,
    activeLocation.value.powerGenerationLines,
    locations.value
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

// Power generation handlers
const handleEditPowerGeneration = (lineId: string) => {
  if (!activeLocation.value) return;
  const line = activeLocation.value.powerGenerationLines.find(l => l.id === lineId);
  if (line) {
    editingPowerLine.value = line;
    isPowerGenerationModalOpen.value = true;
  }
};

const handleDeletePowerGeneration = (lineId: string) => {
  if (!activeLocation.value) return;
  if (confirm('Are you sure you want to delete this power generator?')) {
    deletePowerGenerationLine(activeLocation.value.id, lineId);
  }
};

const handleAddPowerGeneration = () => {
  editingPowerLine.value = null;
  isPowerGenerationModalOpen.value = true;
};

const handlePowerGenerationModalClose = () => {
  isPowerGenerationModalOpen.value = false;
  editingPowerLine.value = null;
};

const handlePowerGenerationModalSave = (line: Omit<PowerGenerationLine, 'id'>) => {
  if (!activeLocation.value) return;

  if (editingPowerLine.value) {
    // Update existing power generation line
    updatePowerGenerationLine(activeLocation.value.id, editingPowerLine.value.id, line);
  } else {
    // Add new power generation line
    addPowerGenerationLine(activeLocation.value.id, line);
  }
};

// Resource export handlers
const handleEditExport = (exportId: string) => {
  if (!activeLocation.value) return;
  const exportItem = activeLocation.value.exports.find(e => e.id === exportId);
  if (exportItem) {
    editingExport.value = exportItem;
    isExportModalOpen.value = true;
  }
};

const handleDeleteExport = (exportId: string) => {
  if (!activeLocation.value) return;
  if (confirm('Are you sure you want to delete this export?')) {
    deleteResourceExport(activeLocation.value.id, exportId);
  }
};

const handleAddExport = () => {
  editingExport.value = null;
  isExportModalOpen.value = true;
};

const handleExportModalClose = () => {
  isExportModalOpen.value = false;
  editingExport.value = null;
};

const handleExportModalSave = (exportData: Omit<ResourceExport, 'id'>) => {
  if (!activeLocation.value) return;

  if (editingExport.value) {
    // Update existing export
    updateResourceExport(activeLocation.value.id, editingExport.value.id, exportData);
  } else {
    // Add new export
    addResourceExport(activeLocation.value.id, exportData);
  }
};

// Sort exports alphabetically by resource name
const sortedExports = computed(() => {
  if (!activeLocation.value) return [];
  return [...activeLocation.value.exports].sort((a, b) => a.resource.localeCompare(b.resource));
});

// Calculate export amounts and warnings
const getExportAmount = (exportConfig: ResourceExport): number => {
  const balance = resourceBalances.value.find(b => b.resource === exportConfig.resource);
  if (!balance) return 0;

  const exportDetail = balance.exports.find(e => e.toLocationId === exportConfig.toLocationId);
  return exportDetail?.amount || 0;
};

const hasExportWarning = (exportConfig: ResourceExport): boolean => {
  if (exportConfig.mode !== 'absolute') return false;

  const balance = resourceBalances.value.find(b => b.resource === exportConfig.resource);
  if (!balance) return false;

  const totalImports = balance.imports.reduce((sum, imp) => sum + imp.amount, 0);
  const totalExports = balance.exports.reduce((sum, exp) => sum + exp.amount, 0);
  const availableSurplus = balance.production + totalImports - balance.consumption;

  return totalExports > availableSurplus;
};

const getLocationName = (locationId: string): string => {
  return locations.value.find(l => l.id === locationId)?.name || 'Unknown';
};
</script>

<template>
  <div v-if="!activeLocation" class="flex items-center justify-center h-96">
    <p class="text-muted-foreground">No location selected</p>
  </div>

  <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
    <!-- Left Panel (Resource Extraction & Production Lines) -->
    <div class="lg:col-span-2 space-y-8">
      <!-- Resource Extraction Section -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">Resource Extraction</h2>
          <Button @click="handleAddExtraction" size="sm">
            <Plus class="h-4 w-4 mr-2" />
            Add Extraction Line
          </Button>
        </div>

        <Card v-if="activeLocation.resourceExtractionLines.length === 0">
          <CardContent class="p-8 text-center">
            <p class="text-muted-foreground">No resource extraction lines yet. Add miners, oil extractors, or water extractors!</p>
          </CardContent>
        </Card>

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
          <h2 class="text-xl font-semibold">Production Lines</h2>
          <Button @click="handleAddProductionLine" size="sm">
            <Plus class="h-4 w-4 mr-2" />
            Add Production Line
          </Button>
        </div>

        <Card v-if="activeLocation.productionLines.length === 0">
          <CardContent class="p-8 text-center">
            <p class="text-muted-foreground">No production lines yet. Add one to get started!</p>
          </CardContent>
        </Card>

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

      <!-- Power Generation Section -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">Power Generation</h2>
          <Button @click="handleAddPowerGeneration" size="sm" variant="secondary">
            <Plus class="h-4 w-4 mr-2" />
            Add Generator
          </Button>
        </div>

        <Card v-if="activeLocation.powerGenerationLines.length === 0">
          <CardContent class="p-8 text-center">
            <p class="text-muted-foreground">No power generators yet. Add biomass burners, coal generators, or other power sources!</p>
          </CardContent>
        </Card>

        <div v-else class="space-y-4">
          <PowerGenerationCard
            v-for="line in validPowerGenerationLines"
            :key="line.id"
            :power-line="line"
            :generator="getGeneratorByKeyName(line.generatorType)!"
            @edit="handleEditPowerGeneration"
            @delete="handleDeletePowerGeneration"
          />
        </div>
      </div>

      <!-- Resource Exports Section -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">Resource Exports</h2>
          <Button @click="handleAddExport" size="sm" variant="secondary">
            <Plus class="h-4 w-4 mr-2" />
            Add Export
          </Button>
        </div>

        <Card v-if="activeLocation.exports.length === 0">
          <CardContent class="p-8 text-center">
            <p class="text-muted-foreground">No resource exports yet. Export surplus resources to other locations!</p>
          </CardContent>
        </Card>

        <div v-else class="space-y-4">
          <ResourceExportCard
            v-for="exp in sortedExports"
            :key="exp.id"
            :resource-export="exp"
            :destination-location-name="getLocationName(exp.toLocationId)"
            :calculated-amount="getExportAmount(exp)"
            :has-warning="hasExportWarning(exp)"
            @edit="handleEditExport"
            @delete="handleDeleteExport"
          />
        </div>
      </div>
    </div>

    <!-- Right Panel (Summaries) -->
    <div class="space-y-4">
      <ResourceSummary :balances="resourceBalances" />
      <PowerSummary :summary="powerSummary" />
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

    <!-- Power Generation Modal -->
    <PowerGenerationModal
      :is-open="isPowerGenerationModalOpen"
      :power-line="editingPowerLine"
      @close="handlePowerGenerationModalClose"
      @save="handlePowerGenerationModalSave"
    />

    <!-- Resource Export Modal -->
    <ResourceExportModal
      :is-open="isExportModalOpen"
      :resource-export="editingExport"
      :available-resources="resourceBalances"
      @close="handleExportModalClose"
      @save="handleExportModalSave"
    />
  </div>
</template>
