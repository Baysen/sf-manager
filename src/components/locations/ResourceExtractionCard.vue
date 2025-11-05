<script setup lang="ts">
import type { ResourceExtractionLine } from '../../types/location';
import { useMiners, type Miner, type Resource } from '../../composables/useMiners';
import { useCalculations } from '../../composables/useCalculations';
import ResourceIcon from '../common/ResourceIcon.vue';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-vue-next';

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

const getPurityVariant = (purity: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (purity) {
    case 'impure':
      return 'destructive';
    case 'normal':
      return 'default';
    case 'pure':
      return 'secondary';
    default:
      return 'outline';
  }
};
</script>

<template>
  <Card class="hover:border-muted-foreground/50 transition-colors">
    <CardContent class="p-3">
      <div class="flex justify-between items-start mb-3">
        <div class="flex items-center gap-3">
          <ResourceIcon :resource-key="resource.key_name" size="md" />
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h4 class="text-base font-semibold">{{ resource.name }}</h4>
              <Badge :variant="getPurityVariant(extractionLine.purity)" class="text-xs">
                {{ getPurityLabel(extractionLine.purity) }}
              </Badge>
            </div>
            <p class="text-xs text-muted-foreground">
              {{ miner.name }} • {{ getTotalMachines(extractionLine) }} machines
            </p>
          </div>
        </div>
        <div class="flex gap-1">
          <Button
            @click="emit('edit', extractionLine.id)"
            variant="ghost"
            size="icon"
            class="h-8 w-8"
          >
            <Pencil class="h-4 w-4" />
          </Button>
          <Button
            @click="emit('delete', extractionLine.id)"
            variant="ghost"
            size="icon"
            class="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div class="text-xs text-muted-foreground mb-3 space-y-0.5">
        <div v-for="(config, index) in extractionLine.overclocking" :key="index">
          <span class="text-foreground">{{ config.count }}</span> @ <span class="text-chart-4">{{ config.percentage }}%</span>
        </div>
      </div>

      <div class="flex items-center justify-between text-xs pt-3 border-t">
        <div>
          <span class="text-muted-foreground">Production:</span>
          <span class="text-green-600 dark:text-green-400 ml-1 font-medium">{{ getExtractionRate().toFixed(1) }}/min</span>
        </div>
        <div class="text-right">
          <span class="text-muted-foreground">Power:</span>
          <span class="text-chart-4 ml-1 font-medium">{{ getTotalPower().toFixed(1) }} MW</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
