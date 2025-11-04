<script setup lang="ts">
import { computed } from 'vue';
import type { PowerBreakdown } from '../../types/location';

const props = defineProps<{
  breakdown: PowerBreakdown[];
}>();

const totalPower = computed(() => {
  return props.breakdown.reduce((sum, item) => sum + item.consumption, 0);
});

const formatPower = (power: number) => {
  return power.toFixed(2);
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
    <h3 class="text-lg font-semibold text-white mb-4">Power Summary</h3>

    <div class="mb-4 pb-4 border-b border-gray-700">
      <div class="flex justify-between items-center">
        <span class="text-gray-300">Total Consumption:</span>
        <span class="text-xl font-bold text-yellow-400">{{ formatPower(totalPower) }} MW</span>
      </div>
    </div>

    <div v-if="breakdown.length === 0" class="text-gray-400 text-sm">
      No power consumption yet
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="item in breakdown"
        :key="item.machineType"
        class="flex justify-between items-center text-sm"
      >
        <span class="text-gray-300">{{ item.machineType }}:</span>
        <span class="text-white font-medium">{{ formatPower(item.consumption) }} MW</span>
      </div>
    </div>
  </div>
</template>
