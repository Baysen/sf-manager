<script setup lang="ts">
import { computed } from 'vue';
import type { PowerBreakdown } from '../../types/location';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const props = defineProps<{
  breakdown: PowerBreakdown[];
}>();

const totalPower = computed(() => {
  return props.breakdown.reduce((sum, item) => sum + item.consumption, 0);
});

const formatPower = (power: number) => {
  return power.toFixed(1);
};
</script>

<template>
  <Card>
    <CardHeader class="pb-3">
      <CardTitle class="text-base">Power Summary</CardTitle>
    </CardHeader>
    <CardContent class="pb-4">
      <div class="mb-3 pb-3 border-b">
        <div class="flex justify-between items-center">
          <span class="text-xs text-muted-foreground">Total Consumption:</span>
          <span class="text-base font-bold text-chart-4">{{ formatPower(totalPower) }} MW</span>
        </div>
      </div>

      <div v-if="breakdown.length === 0" class="text-muted-foreground text-xs">
        No power consumption yet
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="item in breakdown"
          :key="item.machineType"
          class="flex justify-between items-center text-xs"
        >
          <span class="text-muted-foreground">{{ item.machineType }}:</span>
          <span class="font-medium">{{ formatPower(item.consumption) }} MW</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
