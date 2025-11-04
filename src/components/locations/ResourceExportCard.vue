<script setup lang="ts">
import type { ResourceExport } from '../../types/location';
import ResourceIcon from '../common/ResourceIcon.vue';

const props = defineProps<{
  resourceExport: ResourceExport;
  destinationLocationName: string;
  calculatedAmount: number;
  hasWarning: boolean;
}>();

const emit = defineEmits<{
  edit: [id: string];
  delete: [id: string];
}>();

const handleEdit = () => {
  emit('edit', props.resourceExport.id);
};

const handleDelete = () => {
  emit('delete', props.resourceExport.id);
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <ResourceIcon :resource-key="resourceExport.resource" size="sm" />
          <h4 class="text-base font-medium text-white">{{ resourceExport.resource }}</h4>
        </div>

        <div class="space-y-1 text-sm">
          <div class="flex items-center gap-2 text-gray-300">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span>To: <span class="text-blue-400">{{ destinationLocationName }}</span></span>
          </div>

          <div class="flex items-center gap-2 text-gray-300">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>
              Mode:
              <span class="text-yellow-400">
                {{ resourceExport.mode === 'percentage' ? `${resourceExport.value}%` : `${resourceExport.value}/min (absolute)` }}
              </span>
            </span>
          </div>

          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span class="text-gray-300">
              Export Amount:
              <span :class="['font-semibold', hasWarning ? 'text-orange-400' : 'text-green-400']">
                {{ calculatedAmount.toFixed(1) }}/min
              </span>
            </span>
          </div>

          <div v-if="hasWarning" class="mt-2 text-xs text-orange-400 bg-orange-900/20 border border-orange-800/30 rounded px-2 py-1">
            Warning: Export may exceed available surplus
          </div>
        </div>
      </div>

      <div class="flex gap-2 ml-4">
        <button
          @click="handleEdit"
          class="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
          title="Edit"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          @click="handleDelete"
          class="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
          title="Delete"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
