import { ref, computed } from 'vue';
import type { Location, ProductionLine, ResourceExtractionLine } from '../types/location';
import { useStorage } from './useStorage';

const locations = ref<Location[]>([]);
const activeLocationId = ref<string | null>(null);

export function useLocations() {
  const { loadLocations, autoSave, exportData, importData } = useStorage();

  // Initialize on first use
  if (locations.value.length === 0) {
    const loadedLocations = loadLocations();
    locations.value = loadedLocations;
    activeLocationId.value = loadedLocations[0]?.id || null;
    autoSave(locations);
  }

  const activeLocation = computed(() =>
    locations.value.find(l => l.id === activeLocationId.value) || null
  );

  const addLocation = (name: string) => {
    const newLocation: Location = {
      id: `loc-${Date.now()}`,
      name,
      resourceExtractionLines: [],
      productionLines: []
    };
    locations.value.push(newLocation);
    activeLocationId.value = newLocation.id;
  };

  const updateLocation = (id: string, updates: Partial<Omit<Location, 'id'>>) => {
    const location = locations.value.find(l => l.id === id);
    if (location) {
      Object.assign(location, updates);
    }
  };

  const deleteLocation = (id: string) => {
    const index = locations.value.findIndex(l => l.id === id);
    if (index !== -1) {
      locations.value.splice(index, 1);
      if (activeLocationId.value === id) {
        activeLocationId.value = locations.value[0]?.id || null;
      }
    }
  };

  const addProductionLine = (locationId: string, productionLine: Omit<ProductionLine, 'id'>) => {
    const location = locations.value.find(l => l.id === locationId);
    if (location) {
      const newLine: ProductionLine = {
        ...productionLine,
        id: `line-${Date.now()}`
      };
      location.productionLines.push(newLine);
    }
  };

  const updateProductionLine = (locationId: string, lineId: string, updates: Partial<Omit<ProductionLine, 'id'>>) => {
    const location = locations.value.find(l => l.id === locationId);
    if (location) {
      const line = location.productionLines.find(l => l.id === lineId);
      if (line) {
        Object.assign(line, updates);
      }
    }
  };

  const deleteProductionLine = (locationId: string, lineId: string) => {
    const location = locations.value.find(l => l.id === locationId);
    if (location) {
      const index = location.productionLines.findIndex(l => l.id === lineId);
      if (index !== -1) {
        location.productionLines.splice(index, 1);
      }
    }
  };

  const addResourceExtractionLine = (locationId: string, extractionLine: Omit<ResourceExtractionLine, 'id'>) => {
    const location = locations.value.find(l => l.id === locationId);
    if (location) {
      const newLine: ResourceExtractionLine = {
        ...extractionLine,
        id: `extraction-${Date.now()}`
      };
      location.resourceExtractionLines.push(newLine);
    }
  };

  const updateResourceExtractionLine = (locationId: string, lineId: string, updates: Partial<Omit<ResourceExtractionLine, 'id'>>) => {
    const location = locations.value.find(l => l.id === locationId);
    if (location) {
      const line = location.resourceExtractionLines.find(l => l.id === lineId);
      if (line) {
        Object.assign(line, updates);
      }
    }
  };

  const deleteResourceExtractionLine = (locationId: string, lineId: string) => {
    const location = locations.value.find(l => l.id === locationId);
    if (location) {
      const index = location.resourceExtractionLines.findIndex(l => l.id === lineId);
      if (index !== -1) {
        location.resourceExtractionLines.splice(index, 1);
      }
    }
  };

  const handleExport = () => {
    exportData(locations.value);
  };

  const handleImport = async (file: File) => {
    try {
      const importedLocations = await importData(file);
      locations.value = importedLocations;
      activeLocationId.value = importedLocations[0]?.id || null;
    } catch (error) {
      throw error;
    }
  };

  return {
    locations,
    activeLocationId,
    activeLocation,
    addLocation,
    updateLocation,
    deleteLocation,
    addProductionLine,
    updateProductionLine,
    deleteProductionLine,
    addResourceExtractionLine,
    updateResourceExtractionLine,
    deleteResourceExtractionLine,
    handleExport,
    handleImport
  };
}
