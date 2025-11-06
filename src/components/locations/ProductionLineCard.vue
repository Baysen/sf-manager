<script setup lang="ts">
import { computed } from 'vue';
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

const hasSomersloops = computed(() => {
  return props.productionLine.overclocking.some(config => config.somersloops && config.somersloops > 0);
});
</script>

<template>
  <Card
    class="hover:border-muted-foreground/50 transition-all duration-300"
    :class="hasSomersloops ? 'somersloop-glow' : ''"
  >
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
        <div v-for="(config, index) in productionLine.overclocking" :key="index" class="flex items-center gap-2">
          <span><span class="text-foreground">{{ config.count }}</span> @ <span class="text-chart-4">{{ config.percentage }}%</span></span>
          <template v-if="recipe.somersloopSlots && recipe.somersloopSlots > 0 && config.somersloops && config.somersloops > 0">
            <span class="text-muted-foreground">•</span>
            <div class="flex gap-0">
              <img
                v-for="slot in recipe.somersloopSlots"
                :key="slot"
                src="/icons/Somersloop.png"
                alt="Somersloop"
                class="w-4 h-4"
                :class="slot <= config.somersloops ? '' : 'opacity-20'"
              />
            </div>
          </template>
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

<style scoped>
@keyframes somersloop-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgb(168 85 247 / 0.05), 0 10px 15px -3px rgb(168 85 247 / 0.05);
  }
  50% {
    box-shadow: 0 0 0 2px rgb(168 85 247 / 0.1), 0 10px 15px -3px rgb(168 85 247 / 0.1);
  }
}

.somersloop-glow {
  animation: somersloop-pulse 5s ease-in-out infinite;
}
</style>
