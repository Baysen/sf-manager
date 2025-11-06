<script setup lang="ts">
import { ref } from 'vue';
import { useLocations } from '../../composables/useLocations';

const { handleExport, handleImport } = useLocations();
const fileInput = ref<HTMLInputElement | null>(null);
const errorMessage = ref<string>('');
const successMessage = ref<string>('');

const onExport = () => {
  try {
    handleExport();
    showSuccess('Data exported successfully!');
  } catch (error) {
    showError('Failed to export data');
  }
};

const onImportClick = () => {
  fileInput.value?.click();
};

const onFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  try {
    await handleImport(file);
    showSuccess('Data imported successfully!');
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  } catch (error) {
    showError('Failed to import data. Please check the file format.');
  }
};

const showSuccess = (message: string) => {
  successMessage.value = message;
  errorMessage.value = '';
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
};

const showError = (message: string) => {
  errorMessage.value = message;
  successMessage.value = '';
  setTimeout(() => {
    errorMessage.value = '';
  }, 3000);
};
</script>

<template>
  <div class="flex items-center space-x-2">
    <!-- Export Button -->
    <button
      @click="onExport"
      class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
      title="Export data to JSON"
    >
      Export
    </button>

    <!-- Import Button -->
    <button
      @click="onImportClick"
      class="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
      title="Import data from JSON"
    >
      Import
    </button>

    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      @change="onFileSelected"
      class="hidden"
    />

    <!-- Success Message -->
    <div
      v-if="successMessage"
      class="text-sm text-chart-3 animate-fade-in"
    >
      {{ successMessage }}
    </div>

    <!-- Error Message -->
    <div
      v-if="errorMessage"
      class="text-sm text-destructive animate-fade-in"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-in;
}
</style>
