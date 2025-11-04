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
      <div class="flex space-x-2">
        <button
          @click="emit('edit', extractionLine.id)"
          class="px-2 py-1 text-xs font-medium text-blue-400 hover:text-blue-300 border border-blue-400 rounded hover:border-blue-300 transition-colors"
        >
          Edit
        </button>
        <button
          @click="emit('delete', extractionLine.id)"
          class="px-2 py-1 text-xs font-medium text-red-400 hover:text-red-300 border border-red-400 rounded hover:border-red-300 transition-colors"
        >
          Delete
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
