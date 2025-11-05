<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import type { ProductionLine, OverclockingConfig } from '../../types/location';
import { useRecipes } from '../../composables/useRecipes';
import ResourceIcon from '../common/ResourceIcon.vue';

const props = defineProps<{
  isOpen: boolean;
  productionLine?: ProductionLine | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [line: Omit<ProductionLine, 'id'>];
}>();

const { allRecipes } = useRecipes();

// Form state
const selectedOutputResource = ref<string>('');
const selectedRecipeId = ref<string>('');
const overclockingConfigs = ref<OverclockingConfig[]>([
  { count: 1, percentage: 100 }
]);

// Get unique output resources (alphabetically sorted)
const outputResources = computed(() => {
  const resources = new Set<string>();
  allRecipes.value.forEach(recipe => {
    recipe.outputs.forEach(output => {
      resources.add(output.resource);
    });
  });
  return Array.from(resources).sort();
});

// Recipes filtered by selected output resource
const filteredRecipes = computed(() => {
  if (!selectedOutputResource.value) return [];
  return allRecipes.value.filter(recipe =>
    recipe.outputs.some(output => output.resource === selectedOutputResource.value)
  );
});

// Selected recipe details
const selectedRecipe = computed(() => {
  if (!selectedRecipeId.value) return null;
  return allRecipes.value.find(r => r.id === selectedRecipeId.value) || null;
});

// Flag to prevent watcher from interfering during modal initialization
const isInitializing = ref(false);

// Watch for output resource change to reset recipe selection
watch(selectedOutputResource, async (_, oldValue) => {
  // Don't reset recipe selection during modal initialization (edit mode)
  if (isInitializing.value) return;

  // When output resource changes, destroy the old Preline select instance
  // before Vue re-renders with the new key
  if (oldValue) {
    const recipeSelectEl = document.querySelector('#recipe-select');
    if (recipeSelectEl) {
      const instance = (window as any).HSSelect?.getInstance(recipeSelectEl);
      if (instance) {
        instance.destroy();
      }
    }
  }

  selectedRecipeId.value = '';

  // Wait for Vue to re-render with new key, then reinitialize
  await nextTick();
  window.HSStaticMethods?.autoInit();
});

// Calculate total machine count
const totalMachineCount = computed(() => {
  return overclockingConfigs.value.reduce((sum, config) => sum + config.count, 0);
});

// Watch for modal open/close to reset or populate form
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    if (props.productionLine) {
      // Edit mode - populate with existing data
      isInitializing.value = true;

      const line = props.productionLine;
      const recipeIdToRestore = line.recipeId;
      overclockingConfigs.value = line.overclocking.map(config => ({ ...config }));

      // Find and set the output resource for this recipe
      const recipe = allRecipes.value.find(r => r.id === recipeIdToRestore);
      const firstOutput = recipe?.outputs?.[0];
      if (firstOutput) {
        // Set both values immediately - Vue will handle reactivity
        selectedOutputResource.value = firstOutput.resource;
        selectedRecipeId.value = recipeIdToRestore;

        // Wait for DOM to render the recipe section with both values set
        await nextTick();
        await nextTick();

        // Initialize Preline with the already-set values
        window.HSStaticMethods?.autoInit();
      }

      isInitializing.value = false;
    } else {
      // Add mode - reset form
      resetForm();
    }

    // Reinitialize Preline components for the modal content
    await nextTick();
    window.HSStaticMethods?.autoInit();
  }
});

const resetForm = () => {
  selectedOutputResource.value = '';
  selectedRecipeId.value = '';
  overclockingConfigs.value = [{ count: 1, percentage: 100 }];
};

const addOverclockingConfig = () => {
  overclockingConfigs.value.push({ count: 1, percentage: 100 });
};

const removeOverclockingConfig = (index: number) => {
  if (overclockingConfigs.value.length > 1) {
    overclockingConfigs.value.splice(index, 1);
  }
};

const handleSave = () => {
  if (!selectedRecipeId.value || overclockingConfigs.value.length === 0) {
    return;
  }

  // Filter out configs with 0 machines
  const validConfigs = overclockingConfigs.value.filter(config => config.count > 0);

  if (validConfigs.length === 0) {
    return;
  }

  const machineCount = totalMachineCount.value;

  emit('save', {
    recipeId: selectedRecipeId.value,
    machineCount,
    overclocking: validConfigs
  });

  emit('close');
};

const handleClose = () => {
  emit('close');
};

// Preset clock speeds
const presetClockSpeeds = [50, 100, 150, 200, 250];

// Helper function to conditionally add icon to alternate recipes
const getSelectOptionData = (recipe: any) => {
  if (!recipe.isAlternate) return undefined;

  return JSON.stringify({
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-corner-down-right-icon lucide-corner-down-right"><path d="m15 10 5 5-5 5"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></svg>'
  });
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
    @click.self="handleClose"
  >
    <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-700">
      <!-- Modal Header -->
      <div class="flex justify-between items-center p-6 border-b border-gray-700">
        <h3 class="text-xl font-semibold text-white">
          {{ productionLine ? 'Edit Production Line' : 'Add Production Line' }}
        </h3>
        <button
          @click="handleClose"
          class="text-gray-400 hover:text-white transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 space-y-6 overflow-y-auto flex-1">
        <!-- Output Resource Selector -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Output Resource <span class="text-red-400">*</span>
          </label>

          <!-- Resource Select with Search -->
          <select
            v-model="selectedOutputResource"
            data-hs-select='{
              "placeholder": "Select output resource...",
              "hasSearch": true,
              "searchPlaceholder": "Search resources...",
              "toggleTag": "<button type=\"button\" aria-expanded=\"false\"></button>",
              "toggleClasses": "hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 relative py-3 ps-4 pe-9 flex gap-x-2 text-nowrap w-full cursor-pointer bg-gray-900 border border-gray-700 rounded-lg text-start text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white",
              "dropdownScope": "window",
              "dropdownClasses": "mt-2 z-[60] w-full max-h-72 p-1 space-y-0.5 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-600",
              "optionClasses": "py-2 px-4 w-full text-sm text-white cursor-pointer hover:bg-gray-800 rounded-lg focus:outline-none focus:bg-gray-800",
              "optionTemplate": "<div class=\"flex justify-between items-center w-full\"><span data-title></span><span class=\"hidden hs-selected:block\"><svg class=\"shrink-0 size-3.5 text-blue-500\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"20 6 9 17 4 12\"/></svg></span></div>",
              "extraMarkup": "<div class=\"absolute top-1/2 end-3 -translate-y-1/2\"><svg class=\"shrink-0 size-3.5 text-gray-500\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m7 15 5 5 5-5\"/><path d=\"m7 9 5-5 5 5\"/></svg></div>",
              "searchWrapperClasses": "bg-gray-900 p-2",
              "searchClasses": "block w-full text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
            }'
            class="hidden"
          >
            <option value="">Select output resource...</option>
            <option
              v-for="resource in outputResources"
              :key="resource"
              :value="resource"
            >
              {{ resource }}
            </option>
          </select>
        </div>

        <!-- Recipe Selector -->
        <div v-if="selectedOutputResource" :key="'recipe-section-' + selectedOutputResource">
          <label class="block text-sm font-medium text-gray-300 mb-2" for="recipe-select">
            Recipe <span class="text-red-400">*</span>
          </label>

          <!-- Recipe Select -->
          <select
              id="recipe-select"
              v-model="selectedRecipeId"
              data-hs-select='{
                "placeholder": "Select a recipe...",
                "hasSearch": false,
                "toggleTag": "<button type=\"button\" aria-expanded=\"false\"></button>",
                "toggleClasses": "hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 relative py-3 ps-4 pe-9 flex gap-x-2 text-nowrap w-full cursor-pointer bg-gray-900 border border-gray-700 rounded-lg text-start text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white",
                "dropdownScope": "window",
                "dropdownClasses": "mt-2 z-[60] w-full max-h-72 p-1 space-y-0.5 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-600",
                "optionClasses": "py-2 px-4 w-full text-sm text-white cursor-pointer hover:bg-gray-800 rounded-lg focus:outline-none focus:bg-gray-800",
                "optionTemplate": "<div class=\"flex justify-between items-center w-full\"><div class=\"flex items-center gap-x-2\"><div class=\"flex items-center\" data-icon></div><span data-title></span></div><span class=\"hidden hs-selected:block\"><svg class=\"shrink-0 size-3.5 text-blue-500\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"20 6 9 17 4 12\"/></svg></span></div>",
                "extraMarkup": "<div class=\"absolute top-1/2 end-3 -translate-y-1/2\"><svg class=\"shrink-0 size-3.5 text-gray-500\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m7 15 5 5 5-5\"/><path d=\"m7 9 5-5 5 5\"/></svg></div>"
              }'
              class="hidden"
            >
            
              <option value="">Select a recipe...</option>
              <option
                v-if="selectedOutputResource"
                v-for="recipe in filteredRecipes"
                :key="recipe.id"
                :value="recipe.id"
                :data-hs-select-option="getSelectOptionData(recipe)"
                :selected="selectedRecipeId === recipe.id"
              >
                {{ recipe.name }} - {{ recipe.machine }}{{ recipe.isAlternate ? ' (Alternate)' : '' }}
              </option>
            </select>

          <!-- Selected recipe details -->
          <div v-if="selectedRecipe" class="mt-4 p-4 bg-gray-900 rounded-md border border-gray-700">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-xs text-gray-400 mb-2">Inputs</div>
                <div class="space-y-1">
                  <div v-for="input in selectedRecipe.inputs" :key="input.resource" class="text-sm text-white flex items-center gap-2">
                    <ResourceIcon :resource-key="input.resource" size="sm" />
                    <span>{{ input.resource }}:</span>
                    <span class="text-red-400">{{ input.amount }}/min</span>
                  </div>
                </div>
              </div>
              <div>
                <div class="text-xs text-gray-400 mb-2">Outputs</div>
                <div class="space-y-1">
                  <div v-for="output in selectedRecipe.outputs" :key="output.resource" class="text-sm text-white flex items-center gap-2">
                    <ResourceIcon :resource-key="output.resource" size="sm" />
                    <span>{{ output.resource }}:</span>
                    <span class="text-green-400">{{ output.amount }}/min</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-3 text-sm text-gray-300">
              Power: <span class="text-yellow-400">{{ selectedRecipe.powerConsumption }} MW</span> per machine at 100%
            </div>
          </div>
        </div>

        <!-- Overclocking Configuration -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-medium text-gray-300">
              Overclocking Configuration <span class="text-red-400">*</span>
            </label>
            <button
              @click="addOverclockingConfig"
              class="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              + Add Config
            </button>
          </div>

          <div class="space-y-3">
            <div
              v-for="(config, index) in overclockingConfigs"
              :key="index"
              class="flex items-center space-x-3 p-3 bg-gray-900 rounded-md border border-gray-700"
            >
              <div class="flex-1">
                <label class="block text-xs text-gray-400 mb-1">Machine Count</label>
                <input
                  v-model.number="config.count"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div class="flex-1">
                <label class="block text-xs text-gray-400 mb-1">Clock Speed (%)</label>
                <input
                  v-model.number="config.percentage"
                  type="number"
                  min="1"
                  max="250"
                  class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div class="flex-1">
                <label class="block text-xs text-gray-400 mb-1">Presets</label>
                <div class="flex space-x-1">
                  <button
                    v-for="speed in presetClockSpeeds"
                    :key="speed"
                    @click="config.percentage = speed"
                    class="px-2 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    {{ speed }}
                  </button>
                </div>
              </div>

              <button
                v-if="overclockingConfigs.length > 1"
                @click="removeOverclockingConfig(index)"
                class="text-red-400 hover:text-red-300 transition-colors mt-5"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Total machine count -->
          <div class="mt-3 text-sm text-gray-300">
            Total Machines: <span class="text-white font-semibold">{{ totalMachineCount }}</span>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex justify-end space-x-3 p-6 border-t border-gray-700 flex-shrink-0">
        <button
          @click="handleClose"
          class="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleSave"
          :disabled="!selectedOutputResource || !selectedRecipeId || totalMachineCount === 0"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {{ productionLine ? 'Update' : 'Add' }} Production Line
        </button>
      </div>
    </div>
  </div>
</template>
