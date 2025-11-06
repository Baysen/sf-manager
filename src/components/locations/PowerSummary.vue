<script setup lang="ts">
import { computed } from 'vue';
import type { PowerSummary } from '../../types/location';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Zap } from 'lucide-vue-next';

const props = defineProps<{
  summary: PowerSummary;
}>();

const formatPower = (power: number) => {
  return power.toFixed(1);
};

const netPowerStatus = computed(() => {
  if (props.summary.netPower > 0.1) return 'surplus';
  if (props.summary.netPower < -0.1) return 'deficit';
  return 'balanced';
});

const netPowerColor = computed(() => {
  switch (netPowerStatus.value) {
    case 'surplus':
      return 'text-green-600 dark:text-green-400';
    case 'deficit':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-yellow-600 dark:text-yellow-400';
  }
});
</script>

<template>
  <Card>
    <CardHeader class="pb-3">
      <div class="flex items-center gap-2">
        <Zap class="h-4 w-4 text-chart-4" />
        <CardTitle class="text-base">Power Summary</CardTitle>
      </div>
    </CardHeader>
    <CardContent class="pb-4">
      <!-- Total Generation -->
      <div class="mb-3 pb-3 border-b">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs text-muted-foreground">Total Generation:</span>
          <span class="text-base font-bold text-green-600 dark:text-green-400">
            {{ formatPower(summary.totalGeneration) }} MW
          </span>
        </div>

        <!-- Generation Breakdown -->
        <div v-if="summary.generationBreakdown.length > 0" class="space-y-1 ml-3">
          <div
            v-for="item in summary.generationBreakdown"
            :key="item.machineType"
            class="flex justify-between items-center text-xs"
          >
            <span class="text-muted-foreground">{{ item.machineType }}:</span>
            <span class="font-medium text-green-600 dark:text-green-400">
              {{ formatPower(item.consumption) }} MW
            </span>
          </div>
        </div>
      </div>

      <!-- Total Consumption -->
      <div class="mb-3 pb-3 border-b">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs text-muted-foreground">Total Consumption:</span>
          <span class="text-base font-bold text-red-600 dark:text-red-400">
            {{ formatPower(summary.totalConsumption) }} MW
          </span>
        </div>

        <!-- Consumption Breakdown -->
        <div v-if="summary.consumptionBreakdown.length > 0" class="space-y-1 ml-3">
          <div
            v-for="item in summary.consumptionBreakdown"
            :key="item.machineType"
            class="flex justify-between items-center text-xs"
          >
            <span class="text-muted-foreground">{{ item.machineType }}:</span>
            <span class="font-medium text-red-600 dark:text-red-400">
              {{ formatPower(item.consumption) }} MW
            </span>
          </div>
        </div>

        <div v-else class="text-muted-foreground text-xs ml-3">
          No power consumption yet
        </div>
      </div>

      <!-- Net Power -->
      <div class="flex justify-between items-center">
        <span class="text-xs text-muted-foreground">Net Power:</span>
        <span class="text-base font-bold" :class="netPowerColor">
          {{ formatPower(summary.netPower) }} MW
        </span>
      </div>
      <p class="text-xs text-muted-foreground mt-1">
        <span v-if="netPowerStatus === 'surplus'">Surplus - extra power available</span>
        <span v-else-if="netPowerStatus === 'deficit'">Deficit - not enough power!</span>
        <span v-else>Balanced - producing what you consume</span>
      </p>
    </CardContent>
  </Card>
</template>
