<script setup lang="ts">
import { computed } from 'vue';
import type { ResourceBalance } from '../../types/location';
import ResourceIcon from '../common/ResourceIcon.vue';

const props = defineProps<{
  balances: ResourceBalance[];
}>();

const sortedBalances = computed(() => {
  return [...props.balances].sort((a, b) => a.resource.localeCompare(b.resource));
});

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

    <div v-else class="space-y-3">
      <div
        v-for="balance in sortedBalances"
        :key="balance.resource"
        class="text-xs border-b border-gray-700 pb-3 last:border-b-0 last:pb-0"
      >
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center gap-2">
            <ResourceIcon :resource-key="balance.resource" size="sm" />
            <span class="font-medium text-white text-sm">{{ balance.resource }}</span>
          </div>
          <span :class="['text-xs font-medium', getStatusColor(balance.status)]">
            {{ getStatusText(balance.status) }}
          </span>
        </div>

        <!-- Production -->
        <div class="pl-1 space-y-1">
          <div class="text-gray-300">
            <span class="text-gray-400">Production:</span>
            <span class="text-green-400 ml-1">+{{ formatRate(balance.production) }}/min</span>
          </div>

          <!-- Imports -->
          <div v-if="balance.imports.length > 0">
            <div class="text-gray-400 mb-1">Imports:</div>
            <div class="pl-2 space-y-0.5">
              <div
                v-for="imp in balance.imports"
                :key="imp.fromLocationId"
                class="text-gray-300"
              >
                <span class="text-gray-500">From</span>
                <span class="text-blue-400 ml-1">{{ imp.fromLocationName }}</span>:
                <span class="text-green-400 ml-1">+{{ formatRate(imp.amount) }}/min</span>
              </div>
            </div>
          </div>

          <!-- Consumption -->
          <div class="text-gray-300">
            <span class="text-gray-400">Consumption:</span>
            <span class="text-red-400 ml-1">-{{ formatRate(balance.consumption) }}/min</span>
          </div>

          <!-- Exports -->
          <div v-if="balance.exports.length > 0">
            <div class="text-gray-400 mb-1">Exports:</div>
            <div class="pl-2 space-y-0.5">
              <div
                v-for="exp in balance.exports"
                :key="exp.toLocationId"
                class="text-gray-300"
              >
                <span class="text-gray-500">To</span>
                <span class="text-blue-400 ml-1">{{ exp.toLocationName }}</span>:
                <span class="text-red-400 ml-1">-{{ formatRate(exp.amount) }}/min</span>
              </div>
            </div>
          </div>

          <!-- Net Balance -->
          <div class="text-gray-300 pt-1 border-t border-gray-700/50">
            <span class="text-gray-400 font-medium">Net:</span>
            <span :class="['ml-1 font-semibold', getStatusColor(balance.status)]">
              {{ balance.balance >= 0 ? '+' : '' }}{{ formatRate(balance.balance) }}/min
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
