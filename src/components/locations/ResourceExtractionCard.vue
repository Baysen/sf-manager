<script setup lang="ts">
import type { ResourceExtractionLine } from '../../types/location';
import { useMiners, type Miner, type Resource } from '../../composables/useMiners';
import { useCalculations } from '../../composables/useCalculations';
import ResourceIcon from '../common/ResourceIcon.vue';

const props = defineProps<{
  extractionLine: ResourceExtractionLine;
  miner: Miner;
  resource: Resource;
}>();

const emit = defineEmits<{
  edit: [id: string];
  delete: [id: string];
}>();

const { calculateExtractionRate, calculateExtractionPower } = useCalculations();

const getTotalMachines = (line: ResourceExtractionLine) => {
  return line.overclocking.reduce((sum, config) => sum + config.count, 0);
};

const getExtractionRate = () => {
  return calculateExtractionRate(props.miner, props.extractionLine);
};

const getTotalPower = () => {
  return calculateExtractionPower(props.miner, props.extractionLine);
};

const getPurityLabel = (purity: string) => {
  return purity.charAt(0).toUpperCase() + purity.slice(1);
};

const getPurityColor = (purity: string) => {
  switch (purity) {
    case 'impure':
      return 'text-orange-400';
    case 'normal':
      return 'text-blue-400';
    case 'pure':
      return 'text-purple-400';
    default:
      return 'text-gray-400';
  }
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors">
    <div class="flex justify-between items-start mb-2">
      <div class="flex items-center gap-2">
        <ResourceIcon :resource-key="resource.key_name" size="md" />
        <div>
          <h4 class="text-base font-semibold text-white">{{ resource.name }}</h4>
          <p class="text-xs text-gray-400">
            {{ miner.name }} • {{ getTotalMachines(extractionLine) }} machines •
            <span :class="getPurityColor(extractionLine.purity)">{{ getPurityLabel(extractionLine.purity) }}</span>
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <button
          @click="emit('edit', extractionLine.id)"
          class="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
          title="Edit"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          @click="emit('delete', extractionLine.id)"
          class="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
          title="Delete"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <div class="text-xs text-gray-400 mb-2 space-y-0.5">
      <div v-for="(config, index) in extractionLine.overclocking" :key="index">
        <span class="text-white">{{ config.count }}</span> @ <span class="text-yellow-400">{{ config.percentage }}%</span>
      </div>
    </div>

    <div class="flex items-center justify-between text-xs pt-2 border-t border-gray-700">
      <div>
        <span class="text-gray-400">Production:</span>
        <span class="text-green-400 ml-1">{{ getExtractionRate().toFixed(1) }}/min</span>
      </div>
      <div class="text-right">
        <span class="text-gray-400">Power:</span>
        <span class="text-yellow-400 ml-1">{{ getTotalPower().toFixed(1) }} MW</span>
      </div>
    </div>
  </div>
</template>
