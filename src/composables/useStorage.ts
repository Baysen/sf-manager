import { watch } from 'vue';
import type { Ref } from 'vue';
import type { Location } from '../types/location';

const LOCATIONS_KEY = 'satisfactory-manager-locations';

export function useStorage() {
  const saveLocations = (locations: Location[]) => {
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
  };

  const loadLocations = (): Location[] => {
    const data = localStorage.getItem(LOCATIONS_KEY);
    if (!data) return [];

    const locations = JSON.parse(data) as Location[];

    // Migrate old data: ensure all locations have resourceExtractionLines
    return locations.map(location => ({
      ...location,
      resourceExtractionLines: location.resourceExtractionLines || []
    }));
  };

  const autoSave = (locationsRef: Ref<Location[]>) => {
    watch(locationsRef, (newLocations) => {
      saveLocations(newLocations);
    }, { deep: true });
  };

  const exportData = (locations: Location[]) => {
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      locations
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `satisfactory-manager-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const validateImportData = (data: any): data is { version: string; locations: Location[] } => {
    if (!data || typeof data !== 'object') return false;
    if (!data.version || typeof data.version !== 'string') return false;
    if (!Array.isArray(data.locations)) return false;

    // Validate each location has required fields
    return data.locations.every((loc: any) =>
      loc &&
      typeof loc === 'object' &&
      typeof loc.id === 'string' &&
      typeof loc.name === 'string' &&
      Array.isArray(loc.productionLines) &&
      Array.isArray(loc.resourceExtractionLines)
    );
  };

  const importData = async (file: File): Promise<Location[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);

          if (!validateImportData(data)) {
            reject(new Error('Invalid file format: Missing required fields'));
            return;
          }

          // Migrate data if needed
          const locations = data.locations.map(location => ({
            ...location,
            resourceExtractionLines: location.resourceExtractionLines || []
          }));

          resolve(locations);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  return {
    saveLocations,
    loadLocations,
    autoSave,
    exportData,
    importData
  };
}
