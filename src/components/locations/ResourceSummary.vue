<script setup lang="ts">
import type { ResourceBalance } from '../../types/location';
import ResourceIcon from '../common/ResourceIcon.vue';

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
  return rate.toFixed(1);
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-3 border border-gray-700">
    <h3 class="text-base font-semibold text-white mb-3">Resource Summary</h3>

    <div v-if="balances.length === 0" class="text-gray-400 text-xs">
      No production lines yet
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="balance in balances"
        :key="balance.resource"
        class="text-xs"
      >
        <div class="flex justify-between items-center mb-1">
          <div class="flex items-center gap-2">
            <ResourceIcon :resource-key="balance.resource" size="sm" />
            <span class="font-medium text-white text-sm">{{ balance.resource }}</span>
          </div>
          <span :class="['text-xs font-medium', getStatusColor(balance.status)]">
            {{ getStatusText(balance.status) }}
          </span>
        </div>
        <div class="flex items-center justify-between text-gray-300 pl-1">
          <div class="flex-1">
            <span class="text-gray-400">In:</span>
            <span class="text-green-400 ml-1">+{{ formatRate(balance.production) }}</span>
          </div>
          <div class="flex-1 text-center">
            <span class="text-gray-400">Out:</span>
            <span class="text-red-400 ml-1">-{{ formatRate(balance.consumption) }}</span>
          </div>
          <div class="flex-1 text-right">
            <span class="text-gray-400">Net:</span>
            <span :class="['ml-1 font-medium', getStatusColor(balance.status)]">
              {{ balance.balance >= 0 ? '+' : '' }}{{ formatRate(balance.balance) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
