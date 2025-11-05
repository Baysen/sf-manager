<script setup lang="ts">
import type { ProductionLine } from '../../types/location';
import type { Recipe } from '../../types/recipe';
import { useCalculations } from '../../composables/useCalculations';
import ResourceIcon from '../common/ResourceIcon.vue';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-vue-next';

const props = defineProps<{
  productionLine: ProductionLine;
  recipe: Recipe;
}>();

const emit = defineEmits<{
  edit: [id: string];
  delete: [id: string];
}>();

const { calculateProductionRate, calculatePowerConsumption } = useCalculations();

const getTotalMachines = (line: ProductionLine) => {
  return line.overclocking.reduce((sum, config) => sum + config.count, 0);
};

const getCalculatedRate = (resourceName: string, isInput: boolean) => {
  return calculateProductionRate(props.recipe, props.productionLine, resourceName, isInput);
};

const getTotalPower = () => {
  return calculatePowerConsumption(props.recipe, props.productionLine);
};
</script>

<template>
  <Card class="hover:border-muted-foreground/50 transition-colors">
    <CardContent class="p-3">
      <div class="flex justify-between items-start mb-3">
        <div class="flex items-center gap-3">
          <ResourceIcon v-if="recipe.outputs[0]" :resource-key="recipe.outputs[0].resource" size="md" />
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h4 class="text-base font-semibold">
                <template v-if="recipe.isAlternate && recipe.baseName">
                  {{ recipe.baseName }} <span class="text-muted-foreground">({{ recipe.name }})</span>
                </template>
                <template v-else>
                  {{ recipe.name }}
                </template>
              </h4>
              <Badge v-if="recipe.isAlternate" variant="secondary" class="text-xs">
                ALT
              </Badge>
            </div>
            <p class="text-xs text-muted-foreground">{{ recipe.machine }} • {{ getTotalMachines(productionLine) }} machines</p>
          </div>
        </div>
        <div class="flex gap-1">
          <Button
            @click="emit('edit', productionLine.id)"
            variant="ghost"
            size="icon"
            class="h-8 w-8"
          >
            <Pencil class="h-4 w-4" />
          </Button>
          <Button
            @click="emit('delete', productionLine.id)"
            variant="ghost"
            size="icon"
            class="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div class="text-xs text-muted-foreground mb-3 space-y-0.5">
        <div v-for="(config, index) in productionLine.overclocking" :key="index">
          <span class="text-foreground">{{ config.count }}</span> @ <span class="text-chart-4">{{ config.percentage }}%</span>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4 text-xs pt-3 border-t">
        <div>
          <div class="text-muted-foreground mb-1.5 font-medium">Inputs</div>
          <div class="space-y-1">
            <div v-for="input in recipe.inputs" :key="input.resource" class="flex items-center gap-1.5">
              <ResourceIcon :resource-key="input.resource" size="sm" />
              <span class="text-muted-foreground">{{ input.resource }}:</span>
              <span class="text-destructive font-medium">{{ getCalculatedRate(input.resource, true).toFixed(1) }}/min</span>
            </div>
          </div>
        </div>
        <div>
          <div class="text-muted-foreground mb-1.5 font-medium">Outputs</div>
          <div class="space-y-1">
            <div v-for="output in recipe.outputs" :key="output.resource" class="flex items-center gap-1.5">
              <ResourceIcon :resource-key="output.resource" size="sm" />
              <span class="text-muted-foreground">{{ output.resource }}:</span>
              <span class="text-green-600 dark:text-green-400 font-medium">{{ getCalculatedRate(output.resource, false).toFixed(1) }}/min</span>
            </div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-muted-foreground mb-1.5 font-medium">Power</div>
          <span class="text-chart-4 font-medium">{{ getTotalPower().toFixed(1) }} MW</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
