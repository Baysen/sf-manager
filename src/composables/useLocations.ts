import { ref, computed } from 'vue';
import type { Location, ProductionLine } from '../types/location';
import { useStorage } from './useStorage';

const locations = ref<Location[]>([]);
const activeLocationId = ref<string | null>(null);

export function useLocations() {
  const { loadLocations, autoSave } = useStorage();

  // Initialize on first use
  if (locations.value.length === 0) {
    const loadedLocations = loadLocations();

    // If no locations in storage, create sample data
    if (loadedLocations.length === 0) {
      locations.value = [
        {
          id: 'loc-sample-1',
          name: 'Iron Smelting Complex',
          productionLines: [
            {
              id: 'line-1',
              recipeId: 'iron-ingot',
              machineCount: 4,
              overclocking: [
                { count: 4, percentage: 100 }
              ]
            },
            {
              id: 'line-2',
              recipeId: 'iron-plate',
              machineCount: 2,
              overclocking: [
                { count: 2, percentage: 100 }
              ]
            }
          ]
        }
      ];
      activeLocationId.value = 'loc-sample-1';
    } else {
      locations.value = loadedLocations;
      activeLocationId.value = loadedLocations[0]?.id || null;
    }

    autoSave(locations);
  }

  const activeLocation = computed(() =>
    locations.value.find(l => l.id === activeLocationId.value) || null
  );

  const addLocation = (name: string) => {
    const newLocation: Location = {
      id: `loc-${Date.now()}`,
      name,
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

  return {
    locations,
    activeLocationId,
    activeLocation,
    addLocation,
    updateLocation,
    deleteLocation,
    addProductionLine,
    updateProductionLine,
    deleteProductionLine
  };
}
