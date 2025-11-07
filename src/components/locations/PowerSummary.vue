<script setup lang="ts">
import { computed } from 'vue';
import type { PowerSummary } from '../../types/location';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Globe } from 'lucide-vue-next';

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
      return 'text-chart-3';
    case 'deficit':
      return 'text-chart-5';
    default:
      return 'text-chart-4';
  }
});

const hasGlobalGrid = computed(() => props.summary.globalGridGeneration > 0.01);
const hasLocalGeneration = computed(() => props.summary.localGeneration > 0.01);
const hasLocalGridContribution = computed(() => props.summary.localGridContribution > 0.01);
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
          <span class="text-xs text-muted-foreground">Total Available:</span>
          <span class="text-base font-bold text-chart-3">
            {{ formatPower(summary.totalGeneration) }} MW
          </span>
        </div>

        <!-- Global Grid Generation -->
        <div v-if="hasGlobalGrid" class="ml-3 mb-1">
          <div class="flex justify-between items-center text-xs">
            <span class="text-muted-foreground flex items-center gap-1">
              <Globe class="h-3 w-3" />
              Global Grid:
            </span>
            <span class="font-medium text-chart-3">
              {{ formatPower(summary.globalGridGeneration) }} MW
            </span>
          </div>

          <!-- Local Grid Contribution (if any) -->
          <div v-if="hasLocalGridContribution" class="ml-5 mt-1">
            <div class="flex justify-between items-center text-xs mb-1">
              <span class="text-muted-foreground">
                Produced on site:
              </span>
              <span class="font-medium text-chart-3">
                {{ formatPower(summary.localGridContribution) }} MW
              </span>
            </div>

            <!-- Local Grid Contribution Breakdown by Type -->
            <div v-if="summary.localGridBreakdown.length > 0" class="space-y-1 ml-3">
              <div
                v-for="item in summary.localGridBreakdown"
                :key="item.machineType"
                class="flex justify-between items-center text-xs"
              >
                <span class="text-muted-foreground">{{ item.machineType }}:</span>
                <span class="font-medium text-chart-3">
                  {{ formatPower(item.consumption) }} MW
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Local Generation Breakdown -->
        <div v-if="hasLocalGeneration" class="ml-3">
          <div class="flex justify-between items-center text-xs mb-1">
            <span class="text-muted-foreground flex items-center gap-1">
              <Zap class="h-3 w-3" />
              Local Only:
            </span>
            <span class="font-medium text-chart-3">
              {{ formatPower(summary.localGeneration) }} MW
            </span>
          </div>

          <!-- Local Generation Breakdown by Type -->
          <div v-if="summary.generationBreakdown.length > 0" class="space-y-1 ml-5">
            <div
              v-for="item in summary.generationBreakdown"
              :key="item.machineType"
              class="flex justify-between items-center text-xs"
            >
              <span class="text-muted-foreground">{{ item.machineType }}:</span>
              <span class="font-medium text-chart-3">
                {{ formatPower(item.consumption) }} MW
              </span>
            </div>
          </div>
        </div>

        <!-- No generation message -->
        <div v-if="!hasGlobalGrid && !hasLocalGeneration" class="text-muted-foreground text-xs ml-3">
          No power generation yet
        </div>
      </div>

      <!-- Total Consumption -->
      <div class="mb-3 pb-3 border-b">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs text-muted-foreground">Local Consumption:</span>
          <span class="text-base font-bold text-chart-5">
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
            <span class="font-medium text-chart-5">
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
