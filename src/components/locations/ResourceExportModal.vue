<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { ResourceExport, ResourceBalance } from '../../types/location';
import { useLocations } from '../../composables/useLocations';

const props = defineProps<{
  isOpen: boolean;
  resourceExport: ResourceExport | null;
  availableResources: ResourceBalance[];
}>();

const emit = defineEmits<{
  close: [];
  save: [exportData: Omit<ResourceExport, 'id'>];
}>();

const { locations, activeLocation } = useLocations();

const formData = ref<Omit<ResourceExport, 'id'>>({
  resource: '',
  toLocationId: '',
  mode: 'percentage',
  value: 100
});

// Available locations (excluding current location), sorted alphabetically
const availableLocations = computed(() => {
  if (!activeLocation.value) return [];
  return locations.value
    .filter(loc => loc.id !== activeLocation.value?.id)
    .sort((a, b) => a.name.localeCompare(b.name));
});

// Filter resources to show surplus resources, or the currently selected resource when editing
// Sorted alphabetically by resource name
const surplusResources = computed(() => {
  const surplusOnly = props.availableResources.filter(balance => balance.status === 'surplus');

  // If editing and the current resource is not in the surplus list, add it
  if (props.resourceExport && formData.value.resource) {
    const hasCurrentResource = surplusOnly.some(b => b.resource === formData.value.resource);
    if (!hasCurrentResource) {
      const currentResource = props.availableResources.find(b => b.resource === formData.value.resource);
      if (currentResource) {
        return [...surplusOnly, currentResource].sort((a, b) => a.resource.localeCompare(b.resource));
      }
    }
  }

  return surplusOnly.sort((a, b) => a.resource.localeCompare(b.resource));
});

// Calculate preview amount
const previewAmount = computed(() => {
  if (!formData.value.resource) return 0;

  const balance = props.availableResources.find(b => b.resource === formData.value.resource);
  if (!balance) return 0;

  const totalImports = balance.imports.reduce((sum, imp) => sum + imp.amount, 0);

  // Exclude the current export being edited from total exports
  const totalExports = balance.exports.reduce((sum, exp) => {
    // If editing, exclude this export's current amount
    if (props.resourceExport && exp.toLocationId === props.resourceExport.toLocationId) {
      return sum;
    }
    return sum + exp.amount;
  }, 0);

  const availableSurplus = balance.production + totalImports - balance.consumption - totalExports;

  if (formData.value.mode === 'percentage') {
    return (availableSurplus * formData.value.value) / 100;
  } else {
    return formData.value.value;
  }
});

// Validation
const validationMessages = computed(() => {
  const messages: string[] = [];

  if (!formData.value.resource) {
    messages.push('Please select a resource');
  }

  if (!formData.value.toLocationId) {
    messages.push('Please select a destination location');
  }

  if (formData.value.value <= 0) {
    messages.push('Value must be greater than 0');
  }

  if (formData.value.mode === 'percentage' && formData.value.value > 100) {
    messages.push('Percentage cannot exceed 100%');
  }

  // Check total percentage for this resource
  if (formData.value.mode === 'percentage' && formData.value.resource && activeLocation.value) {
    const existingExports = activeLocation.value.exports.filter(
      exp => exp.resource === formData.value.resource &&
             (props.resourceExport ? exp.id !== props.resourceExport.id : true)
    );
    const totalPercentage = existingExports
      .filter(exp => exp.mode === 'percentage')
      .reduce((sum, exp) => sum + exp.value, 0) + formData.value.value;

    if (totalPercentage > 100) {
      messages.push(`Total export percentage would exceed 100% (currently ${totalPercentage.toFixed(1)}%)`);
    }
  }

  // Check if absolute export exceeds surplus
  if (formData.value.mode === 'absolute' && formData.value.resource) {
    const balance = props.availableResources.find(b => b.resource === formData.value.resource);
    if (balance) {
      const totalImports = balance.imports.reduce((sum, imp) => sum + imp.amount, 0);

      // Exclude the current export being edited from total exports
      const totalExports = balance.exports.reduce((sum, exp) => {
        // If editing, exclude this export's current amount
        if (props.resourceExport && exp.toLocationId === props.resourceExport.toLocationId) {
          return sum;
        }
        return sum + exp.amount;
      }, 0);

      const availableSurplus = balance.production + totalImports - balance.consumption - totalExports;

      if (formData.value.value > availableSurplus) {
        messages.push(`Export amount exceeds available surplus (${availableSurplus.toFixed(1)}/min)`);
      }
    }
  }

  return messages;
});

const isValid = computed(() => validationMessages.value.length === 0);

// Watch for modal open/close and populate form
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.resourceExport) {
      formData.value = { ...props.resourceExport };
    } else {
      formData.value = {
        resource: '',
        toLocationId: '',
        mode: 'percentage',
        value: 100
      };
    }
  }
});

const handleSave = () => {
  if (!isValid.value) return;
  emit('save', formData.value);
  emit('close');
};

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click.self="handleClose"
  >
    <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 border border-gray-700">
      <div class="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 class="text-lg font-semibold text-white">
          {{ resourceExport ? 'Edit Resource Export' : 'Add Resource Export' }}
        </h3>
        <button
          @click="handleClose"
          class="text-gray-400 hover:text-white transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-6 space-y-6">
        <!-- Resource Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Resource</label>
          <select
            v-model="formData.resource"
            class="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a resource</option>
            <option
              v-for="balance in surplusResources"
              :key="balance.resource"
              :value="balance.resource"
            >
              {{ balance.resource }} (Surplus: {{ balance.balance.toFixed(1) }}/min)
            </option>
          </select>
          <p v-if="surplusResources.length === 0" class="mt-1 text-xs text-gray-400">
            No surplus resources available to export
          </p>
        </div>

        <!-- Destination Location -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Destination Location</label>
          <select
            v-model="formData.toLocationId"
            class="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a location</option>
            <option
              v-for="location in availableLocations"
              :key="location.id"
              :value="location.id"
            >
              {{ location.name }}
            </option>
          </select>
        </div>

        <!-- Export Mode -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Export Mode</label>
          <div class="flex gap-4">
            <label class="flex items-center cursor-pointer">
              <input
                type="radio"
                v-model="formData.mode"
                value="percentage"
                class="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span class="text-gray-300">Percentage</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input
                type="radio"
                v-model="formData.mode"
                value="absolute"
                class="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span class="text-gray-300">Absolute Amount</span>
            </label>
          </div>
        </div>

        <!-- Value Input -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            {{ formData.mode === 'percentage' ? 'Percentage (%)' : 'Amount per Minute' }}
          </label>
          <input
            type="number"
            v-model.number="formData.value"
            :min="0"
            :max="formData.mode === 'percentage' ? 100 : undefined"
            step="0.1"
            class="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Preview -->
        <div v-if="formData.resource" class="bg-gray-900 rounded-lg p-4 border border-gray-600">
          <p class="text-sm text-gray-300">
            <span class="font-medium">Preview:</span> Will export
            <span class="text-blue-400 font-semibold">{{ previewAmount.toFixed(1) }}/min</span>
            of {{ formData.resource }}
          </p>
        </div>

        <!-- Validation Messages -->
        <div v-if="validationMessages.length > 0" class="space-y-2">
          <div
            v-for="(message, index) in validationMessages"
            :key="index"
            class="text-sm text-red-400 bg-red-900/20 border border-red-800/30 rounded px-3 py-2"
          >
            {{ message }}
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 p-4 border-t border-gray-700">
        <button
          @click="handleClose"
          class="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleSave"
          :disabled="!isValid"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Export
        </button>
      </div>
    </div>
  </div>
</template>
