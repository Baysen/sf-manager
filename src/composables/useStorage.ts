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
    return data ? JSON.parse(data) : [];
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

  const importData = async (file: File): Promise<Location[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          // TODO: Add validation
          resolve(data.locations || []);
        } catch (error) {
          reject(new Error('Invalid file format'));
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
