<script setup lang="ts">
import type { ResourceExtractionLine } from '../../types/location';
import { useMiners, type Miner, type Resource } from '../../composables/useMiners';
import { useCalculations } from '../../composables/useCalculations';

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
  <div class="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
    <div class="flex justify-between items-start mb-3">
      <div>
        <h4 class="text-lg font-semibold text-white">{{ resource.name }}</h4>
        <p class="text-sm text-gray-400">{{ miner.name }}</p>
      </div>
      <div class="flex space-x-2">
        <button
          @click="emit('edit', extractionLine.id)"
          class="px-3 py-1 text-xs font-medium text-blue-400 hover:text-blue-300 border border-blue-400 rounded hover:border-blue-300 transition-colors"
        >
          Edit
        </button>
        <button
          @click="emit('delete', extractionLine.id)"
          class="px-3 py-1 text-xs font-medium text-red-400 hover:text-red-300 border border-red-400 rounded hover:border-red-300 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>

    <div class="space-y-2 mb-3">
      <div class="text-sm">
        <span class="text-gray-400">Node Purity:</span>
        <span :class="['ml-2 font-medium', getPurityColor(extractionLine.purity)]">
          {{ getPurityLabel(extractionLine.purity) }}
        </span>
      </div>

      <div class="text-sm">
        <span class="text-gray-400">Total Machines:</span>
        <span class="text-white ml-2 font-medium">{{ getTotalMachines(extractionLine) }}</span>
      </div>

      <div class="text-sm">
        <span class="text-gray-400">Overclocking:</span>
        <div class="mt-1 space-y-1">
          <div v-for="(config, index) in extractionLine.overclocking" :key="index" class="ml-2">
            <span class="text-white">{{ config.count }} machines</span>
            <span class="text-gray-400"> at </span>
            <span class="text-yellow-400 font-medium">{{ config.percentage }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="pt-3 border-t border-gray-700">
      <div class="text-sm mb-2">
        <span class="text-gray-400">Production:</span>
        <span class="text-green-400 ml-2 font-medium">{{ getExtractionRate().toFixed(2) }}/min</span>
      </div>
      <div class="text-sm">
        <span class="text-gray-400">Total Power:</span>
        <span class="text-yellow-400 ml-2 font-medium">{{ getTotalPower().toFixed(2) }} MW</span>
      </div>
    </div>
  </div>
</template>
