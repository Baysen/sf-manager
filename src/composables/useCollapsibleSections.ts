import { ref, computed, watch } from 'vue';

const STORAGE_KEY = 'satisfactory-manager-collapsible-sections';

export interface SectionStates {
  resourceExtraction: boolean;
  productionLines: boolean;
  powerGeneration: boolean;
  resourceExports: boolean;
}

// Default: all sections open
const defaultStates: SectionStates = {
  resourceExtraction: true,
  productionLines: true,
  powerGeneration: true,
  resourceExports: true,
};

// Store states per location ID
const sectionStates = ref<Record<string, SectionStates>>({});

function loadStates() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      sectionStates.value = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse collapsible section states:', e);
      sectionStates.value = {};
    }
  }
}

function saveStates() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sectionStates.value));
}

// Load states on initialization
loadStates();

// Watch for changes and auto-save
watch(sectionStates, saveStates, { deep: true });

export function useCollapsibleSections(locationId: string) {
  // Initialize states for this location if not exists
  if (!sectionStates.value[locationId]) {
    sectionStates.value[locationId] = { ...defaultStates };
  }

  const states = ref<SectionStates>(sectionStates.value[locationId]);

  // Sync changes back to the main store
  watch(
    states,
    (newStates) => {
      sectionStates.value[locationId] = newStates;
    },
    { deep: true }
  );

  return {
    resourceExtractionOpen: computed({
      get: () => states.value.resourceExtraction,
      set: (val: boolean) => {
        states.value.resourceExtraction = val;
      },
    }),
    productionLinesOpen: computed({
      get: () => states.value.productionLines,
      set: (val: boolean) => {
        states.value.productionLines = val;
      },
    }),
    powerGenerationOpen: computed({
      get: () => states.value.powerGeneration,
      set: (val: boolean) => {
        states.value.powerGeneration = val;
      },
    }),
    resourceExportsOpen: computed({
      get: () => states.value.resourceExports,
      set: (val: boolean) => {
        states.value.resourceExports = val;
      },
    }),
  };
}
