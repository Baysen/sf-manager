<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLocations } from '../../composables/useLocations';
import { useRecipes } from '../../composables/useRecipes';
import { useMiners } from '../../composables/useMiners';
import { usePowerGenerators } from '../../composables/usePowerGenerators';
import { useCalculations } from '../../composables/useCalculations';
import { useCollapsibleSections } from '../../composables/useCollapsibleSections';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronDown } from 'lucide-vue-next';

const { locations, activeLocation, addProductionLine, updateProductionLine, deleteProductionLine, addResourceExtractionLine, updateResourceExtractionLine, deleteResourceExtractionLine, addPowerGenerationLine, updatePowerGenerationLine, deletePowerGenerationLine, addResourceExport, updateResourceExport, deleteResourceExport } = useLocations();
const { allRecipes, getRecipeById } = useRecipes();
const { getMinerByKeyName, getResourceByKeyName } = useMiners();
const { getGeneratorByKeyName } = usePowerGenerators();
const { calculateResourceBalances, calculatePowerSummary } = useCalculations();

// Collapsible sections state - reactive to active location changes
const collapsibleSections = ref<ReturnType<typeof useCollapsibleSections> | null>(null);

// Initialize collapsible sections when active location changes
watch(
  activeLocation,
  (location) => {
    if (location) {
      collapsibleSections.value = useCollapsibleSections(location.id);
    }
  },
  { immediate: true }
);

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

// Delete confirmation dialogs state
const deleteProductionDialogOpen = ref(false);
const deletingProductionLine = ref<ProductionLine | null>(null);

const deleteExtractionDialogOpen = ref(false);
const deletingExtractionLine = ref<ResourceExtractionLine | null>(null);

const deletePowerDialogOpen = ref(false);
const deletingPowerLine = ref<PowerGenerationLine | null>(null);

const deleteExportDialogOpen = ref(false);
const deletingExport = ref<ResourceExport | null>(null);

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

// Filter extraction lines to only show those with valid resources, sorted alphabetically by resource name
const validExtractionLines = computed(() => {
  if (!activeLocation.value) return [];
  return activeLocation.value.resourceExtractionLines
    .filter(line => getResourceByKeyName(line.resourceType))
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
    localGridContribution: 0,
    globalGridGeneration: 0,
    totalConsumption: 0,
    netPower: 0,
    generationBreakdown: [],
    localGridBreakdown: [],
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
  const line = activeLocation.value.productionLines.find(l => l.id === lineId);
  if (line) {
    deletingProductionLine.value = line;
    deleteProductionDialogOpen.value = true;
  }
};

const handleConfirmDeleteProduction = () => {
  if (!activeLocation.value || !deletingProductionLine.value) return;
  deleteProductionLine(activeLocation.value.id, deletingProductionLine.value.id);
  deletingProductionLine.value = null;
  deleteProductionDialogOpen.value = false;
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
  const line = activeLocation.value.resourceExtractionLines.find(l => l.id === lineId);
  if (line) {
    deletingExtractionLine.value = line;
    deleteExtractionDialogOpen.value = true;
  }
};

const handleConfirmDeleteExtraction = () => {
  if (!activeLocation.value || !deletingExtractionLine.value) return;
  deleteResourceExtractionLine(activeLocation.value.id, deletingExtractionLine.value.id);
  deletingExtractionLine.value = null;
  deleteExtractionDialogOpen.value = false;
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
  const line = activeLocation.value.powerGenerationLines.find(l => l.id === lineId);
  if (line) {
    deletingPowerLine.value = line;
    deletePowerDialogOpen.value = true;
  }
};

const handleConfirmDeletePower = () => {
  if (!activeLocation.value || !deletingPowerLine.value) return;
  deletePowerGenerationLine(activeLocation.value.id, deletingPowerLine.value.id);
  deletingPowerLine.value = null;
  deletePowerDialogOpen.value = false;
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
  const exportItem = activeLocation.value.exports.find(e => e.id === exportId);
  if (exportItem) {
    deletingExport.value = exportItem;
    deleteExportDialogOpen.value = true;
  }
};

const handleConfirmDeleteExport = () => {
  if (!activeLocation.value || !deletingExport.value) return;
  deleteResourceExport(activeLocation.value.id, deletingExport.value.id);
  deletingExport.value = null;
  deleteExportDialogOpen.value = false;
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
      <Collapsible v-if="collapsibleSections" v-model:open="collapsibleSections.resourceExtractionOpen">
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <CollapsibleTrigger class="flex items-center gap-2 hover:text-primary transition-colors group">
              <ChevronDown
                class="h-5 w-5 transition-transform duration-200"
                :class="{ '-rotate-90': !collapsibleSections.resourceExtractionOpen }"
              />
              <h2 class="text-xl font-semibold">Resource Extraction</h2>
              <Badge variant="secondary" class="ml-2">
                {{ activeLocation.resourceExtractionLines.length }}
              </Badge>
            </CollapsibleTrigger>
            <Button @click="handleAddExtraction" size="sm">
              <Plus class="h-4 w-4 mr-2" />
              Add Extraction Line
            </Button>
          </div>

          <CollapsibleContent class="space-y-4">
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
                :resource="getResourceByKeyName(line.resourceType)!"
                @edit="handleEditExtraction"
                @delete="handleDeleteExtraction"
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <!-- Production Lines Section -->
      <Collapsible v-if="collapsibleSections" v-model:open="collapsibleSections.productionLinesOpen">
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <CollapsibleTrigger class="flex items-center gap-2 hover:text-primary transition-colors group">
              <ChevronDown
                class="h-5 w-5 transition-transform duration-200"
                :class="{ '-rotate-90': !collapsibleSections.productionLinesOpen }"
              />
              <h2 class="text-xl font-semibold">Production Lines</h2>
              <Badge variant="secondary" class="ml-2">
                {{ activeLocation.productionLines.length }}
              </Badge>
            </CollapsibleTrigger>
            <Button @click="handleAddProductionLine" size="sm">
              <Plus class="h-4 w-4 mr-2" />
              Add Production Line
            </Button>
          </div>

          <CollapsibleContent class="space-y-4">
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
                :resource-balances="resourceBalances"
                @edit="handleEdit"
                @delete="handleDelete"
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <!-- Power Generation Section -->
      <Collapsible v-if="collapsibleSections" v-model:open="collapsibleSections.powerGenerationOpen">
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <CollapsibleTrigger class="flex items-center gap-2 hover:text-primary transition-colors group">
              <ChevronDown
                class="h-5 w-5 transition-transform duration-200"
                :class="{ '-rotate-90': !collapsibleSections.powerGenerationOpen }"
              />
              <h2 class="text-xl font-semibold">Power Generation</h2>
              <Badge variant="secondary" class="ml-2">
                {{ activeLocation.powerGenerationLines.length }}
              </Badge>
            </CollapsibleTrigger>
            <Button @click="handleAddPowerGeneration" size="sm" variant="secondary">
              <Plus class="h-4 w-4 mr-2" />
              Add Generator
            </Button>
          </div>

          <CollapsibleContent class="space-y-4">
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
                :resource-balances="resourceBalances"
                @edit="handleEditPowerGeneration"
                @delete="handleDeletePowerGeneration"
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <!-- Resource Exports Section -->
      <Collapsible v-if="collapsibleSections" v-model:open="collapsibleSections.resourceExportsOpen">
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <CollapsibleTrigger class="flex items-center gap-2 hover:text-primary transition-colors group">
              <ChevronDown
                class="h-5 w-5 transition-transform duration-200"
                :class="{ '-rotate-90': !collapsibleSections.resourceExportsOpen }"
              />
              <h2 class="text-xl font-semibold">Resource Exports</h2>
              <Badge variant="secondary" class="ml-2">
                {{ activeLocation.exports.length }}
              </Badge>
            </CollapsibleTrigger>
            <Button @click="handleAddExport" size="sm" variant="secondary">
              <Plus class="h-4 w-4 mr-2" />
              Add Export
            </Button>
          </div>

          <CollapsibleContent class="space-y-4">
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
          </CollapsibleContent>
        </div>
      </Collapsible>
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
      :resource-balances="resourceBalances"
      @close="handleModalClose"
      @save="handleModalSave"
    />

    <!-- Power Generation Modal -->
    <PowerGenerationModal
      :is-open="isPowerGenerationModalOpen"
      :power-line="editingPowerLine"
      :resource-balances="resourceBalances"
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

    <!-- Delete Production Line Confirmation Dialog -->
    <AlertDialog v-model:open="deleteProductionDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Production Line?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this production line. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            @click="handleConfirmDeleteProduction"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Delete Resource Extraction Confirmation Dialog -->
    <AlertDialog v-model:open="deleteExtractionDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Resource Extraction?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this resource extraction line. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            @click="handleConfirmDeleteExtraction"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Delete Power Generation Confirmation Dialog -->
    <AlertDialog v-model:open="deletePowerDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Power Generator?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this power generation line. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            @click="handleConfirmDeletePower"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Delete Resource Export Confirmation Dialog -->
    <AlertDialog v-model:open="deleteExportDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Resource Export?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this resource export. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            @click="handleConfirmDeleteExport"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
