<script setup lang="ts">
import { ref } from 'vue';
import type { Location } from '../../types/location';

defineProps<{
  locations: Location[];
  activeLocationId: string | null;
}>();

const emit = defineEmits<{
  selectLocation: [id: string];
  addLocation: [name: string];
}>();

const showAddModal = ref(false);
const newLocationName = ref('');

const handleAddLocation = () => {
  if (newLocationName.value.trim()) {
    emit('addLocation', newLocationName.value.trim());
    newLocationName.value = '';
    showAddModal.value = false;
  }
};

const closeModal = () => {
  showAddModal.value = false;
  newLocationName.value = '';
};
</script>

<template>
  <div class="border-b border-gray-700">
    <div class="flex items-center space-x-2 px-4">
      <button
        v-for="location in locations"
        :key="location.id"
        @click="emit('selectLocation', location.id)"
        :class="[
          'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
          activeLocationId === location.id
            ? 'border-blue-500 text-blue-500'
            : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
        ]"
      >
        {{ location.name }}
      </button>
      <button
        @click="showAddModal = true"
        class="px-4 py-3 text-sm font-medium text-gray-400 hover:text-gray-300 border-b-2 border-transparent"
      >
        + Add Location
      </button>
    </div>
  </div>

  <!-- Add Location Modal -->
  <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeModal">
    <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
      <h3 class="text-lg font-semibold text-white mb-4">Add New Location</h3>
      <input
        v-model="newLocationName"
        type="text"
        placeholder="Location name (e.g., Iron Smelting Complex)"
        class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        @keyup.enter="handleAddLocation"
        @keyup.esc="closeModal"
        autofocus
      />
      <div class="mt-4 flex justify-end space-x-2">
        <button
          @click="closeModal"
          class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleAddLocation"
          :disabled="!newLocationName.trim()"
          class="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          Add Location
        </button>
      </div>
    </div>
  </div>
</template>
