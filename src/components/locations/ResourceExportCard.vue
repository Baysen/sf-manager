<script setup lang="ts">
import type { ResourceExport } from '../../types/location';
import ResourceIcon from '../common/ResourceIcon.vue';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ArrowRight, Calculator, TrendingUp } from 'lucide-vue-next';

const props = defineProps<{
  resourceExport: ResourceExport;
  destinationLocationName: string;
  calculatedAmount: number;
  hasWarning: boolean;
}>();

const emit = defineEmits<{
  edit: [id: string];
  delete: [id: string];
}>();

const handleEdit = () => {
  emit('edit', props.resourceExport.id);
};

const handleDelete = () => {
  emit('delete', props.resourceExport.id);
};
</script>

<template>
  <Card class="hover:border-muted-foreground/50 transition-colors">
    <CardContent class="p-3">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-3">
            <ResourceIcon :resource-key="resourceExport.resource" size="sm" />
            <h4 class="text-base font-semibold">{{ resourceExport.resource }}</h4>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2">
              <ArrowRight class="h-4 w-4 text-muted-foreground" />
              <span class="text-muted-foreground">To:</span>
              <span class="text-primary font-medium">{{ destinationLocationName }}</span>
            </div>

            <div class="flex items-center gap-2">
              <Calculator class="h-4 w-4 text-muted-foreground" />
              <span class="text-muted-foreground">Mode:</span>
              <Badge variant="secondary" class="text-xs">
                {{ resourceExport.mode === 'percentage' ? `${resourceExport.value}%` : `${resourceExport.value}/min` }}
              </Badge>
            </div>

            <div class="flex items-center gap-2">
              <TrendingUp class="h-4 w-4 text-muted-foreground" />
              <span class="text-muted-foreground">Export Amount:</span>
              <span :class="['font-semibold', hasWarning ? 'text-chart-4' : 'text-chart-3']">
                {{ calculatedAmount.toFixed(1) }}/min
              </span>
            </div>

            <div v-if="hasWarning" class="text-xs text-chart-4 bg-chart-4/10 border border-chart-4/30 rounded-md px-2 py-1.5 mt-2">
              Warning: Export may exceed available surplus
            </div>
          </div>
        </div>

        <div class="flex gap-1 ml-4">
          <Button
            @click="handleEdit"
            variant="ghost"
            size="icon"
            class="h-8 w-8"
          >
            <Pencil class="h-4 w-4" />
          </Button>
          <Button
            @click="handleDelete"
            variant="ghost"
            size="icon"
            class="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
