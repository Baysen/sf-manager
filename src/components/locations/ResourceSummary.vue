<script setup lang="ts">
import type { ResourceBalance } from '../../types/location';

defineProps<{
  balances: ResourceBalance[];
}>();

const getStatusColor = (status: string) => {
  switch (status) {
    case 'surplus': return 'text-green-400';
    case 'deficit': return 'text-red-400';
    case 'balanced': return 'text-yellow-400';
    default: return 'text-gray-400';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'surplus': return 'Surplus';
    case 'deficit': return 'Deficit';
    case 'balanced': return 'Balanced';
    default: return 'Unknown';
  }
};

const formatRate = (rate: number) => {
  return rate.toFixed(2);
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
    <h3 class="text-lg font-semibold text-white mb-4">Resource Summary</h3>

    <div v-if="balances.length === 0" class="text-gray-400 text-sm">
      No production lines yet
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="balance in balances"
        :key="balance.resource"
        class="border-b border-gray-700 pb-3 last:border-b-0 last:pb-0"
      >
        <div class="flex justify-between items-start mb-2">
          <span class="font-medium text-white">{{ balance.resource }}</span>
          <span :class="['text-sm font-semibold', getStatusColor(balance.status)]">
            {{ getStatusText(balance.status) }}
          </span>
        </div>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between text-gray-300">
            <span>Production:</span>
            <span class="text-green-400">+{{ formatRate(balance.production) }}/min</span>
          </div>
          <div class="flex justify-between text-gray-300">
            <span>Consumption:</span>
            <span class="text-red-400">-{{ formatRate(balance.consumption) }}/min</span>
          </div>
          <div class="flex justify-between font-medium">
            <span class="text-white">Balance:</span>
            <span :class="getStatusColor(balance.status)">
              {{ balance.balance >= 0 ? '+' : '' }}{{ formatRate(balance.balance) }}/min
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
