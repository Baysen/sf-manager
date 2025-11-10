import { watch } from 'vue';
import type { Ref } from 'vue';
import type { Location } from '../types/location';
import { migrateData, validateImportData, CURRENT_VERSION } from './useMigrations';

const LOCATIONS_KEY = 'satisfactory-manager-locations';
const VERSION_KEY = 'satisfactory-manager-version';

export function useStorage() {
  const saveLocations = (locations: Location[]) => {
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  };

  const loadLocations = (): Location[] => {
    const data = localStorage.getItem(LOCATIONS_KEY);
    if (!data) return [];

    const version = localStorage.getItem(VERSION_KEY);
    const parsedData = JSON.parse(data);

    // Wrap data with version info for migration system
    const dataWithVersion = {
      version: version || '1.0.0', // Default to 1.0.0 if no version marker
      locations: Array.isArray(parsedData) ? parsedData : parsedData.locations || []
    };

    // Apply migrations to bring data to current version
    const migratedLocations = migrateData(dataWithVersion);

    // Save migrated data with current version marker
    if (version !== CURRENT_VERSION) {
      console.log(`Migrated localStorage from ${version || '1.0.0'} to ${CURRENT_VERSION}`);
      saveLocations(migratedLocations);
    }

    return migratedLocations;
  };

  const autoSave = (locationsRef: Ref<Location[]>) => {
    watch(locationsRef, (newLocations) => {
      saveLocations(newLocations);
    }, { deep: true });
  };

  const exportData = (locations: Location[]) => {
    const exportData = {
      version: CURRENT_VERSION,
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

          // Apply migrations to bring data to current version
          const locations = migrateData(data);

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
