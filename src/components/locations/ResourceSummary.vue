<script setup lang="ts">
import { computed } from 'vue';
import type { ResourceBalance } from '../../types/location';
import ResourceIcon from '../common/ResourceIcon.vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const props = defineProps<{
  balances: ResourceBalance[];
}>();

const sortedBalances = computed(() => {
  return [...props.balances].sort((a, b) => a.resource.localeCompare(b.resource));
});

const getStatusColor = (status: string) => {
  switch (status) {
    case 'surplus': return 'text-green-600 dark:text-green-400';
    case 'deficit': return 'text-destructive';
    case 'balanced': return 'text-chart-4';
    default: return 'text-muted-foreground';
  }
};

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'surplus': return 'default';
    case 'deficit': return 'destructive';
    case 'balanced': return 'secondary';
    default: return 'outline';
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
  <Card>
    <CardHeader class="pb-3">
      <CardTitle class="text-base">Resource Summary</CardTitle>
    </CardHeader>
    <CardContent class="pb-4">
      <div v-if="balances.length === 0" class="text-muted-foreground text-xs">
        No production lines yet
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="balance in sortedBalances"
          :key="balance.resource"
          class="text-xs border-b pb-3 last:border-b-0 last:pb-0"
        >
          <div class="flex justify-between items-center mb-2">
            <div class="flex items-center gap-2">
              <ResourceIcon :resource-key="balance.resource" size="sm" />
              <span class="font-medium text-sm">{{ balance.resource }}</span>
            </div>
            <Badge :variant="getStatusVariant(balance.status)" class="text-xs">
              {{ getStatusText(balance.status) }}
            </Badge>
          </div>

          <!-- Production -->
          <div class="pl-1 space-y-1.5">
            <div>
              <span class="text-muted-foreground">Production:</span>
              <span class="text-green-600 dark:text-green-400 ml-1 font-medium">+{{ formatRate(balance.production) }}/min</span>
            </div>

            <!-- Imports -->
            <div v-if="balance.imports.length > 0">
              <div class="text-muted-foreground mb-1">Imports:</div>
              <div class="pl-2 space-y-0.5">
                <div
                  v-for="imp in balance.imports"
                  :key="imp.fromLocationId"
                >
                  <span class="text-muted-foreground/70">From</span>
                  <span class="text-primary ml-1">{{ imp.fromLocationName }}</span>:
                  <span class="text-green-600 dark:text-green-400 ml-1 font-medium">+{{ formatRate(imp.amount) }}/min</span>
                </div>
              </div>
            </div>

            <!-- Consumption -->
            <div>
              <span class="text-muted-foreground">Consumption:</span>
              <span class="text-destructive ml-1 font-medium">-{{ formatRate(balance.consumption) }}/min</span>
            </div>

            <!-- Exports -->
            <div v-if="balance.exports.length > 0">
              <div class="text-muted-foreground mb-1">Exports:</div>
              <div class="pl-2 space-y-0.5">
                <div
                  v-for="exp in balance.exports"
                  :key="exp.toLocationId"
                >
                  <span class="text-muted-foreground/70">To</span>
                  <span class="text-primary ml-1">{{ exp.toLocationName }}</span>:
                  <span class="text-destructive ml-1 font-medium">-{{ formatRate(exp.amount) }}/min</span>
                </div>
              </div>
            </div>

            <!-- Net Balance -->
            <div class="pt-1.5 border-t border-border/50">
              <span class="text-muted-foreground font-medium">Net:</span>
              <span :class="['ml-1 font-bold', getStatusColor(balance.status)]">
                {{ balance.balance >= 0 ? '+' : '' }}{{ formatRate(balance.balance) }}/min
              </span>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
