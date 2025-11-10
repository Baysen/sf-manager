<script setup lang="ts">
import { computed } from 'vue';
import type { ProductionLine } from '../../types/location';
import type { Recipe } from '../../types/recipe';
import { useCalculations } from '../../composables/useCalculations';
import ResourceIcon from '../common/ResourceIcon.vue';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Pencil, Trash2, Zap } from 'lucide-vue-next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
      <div class="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 items-start">
        <!-- Column 1: Icon, Name, Machine, Configs -->
        <div class="flex items-start gap-3">
          <ResourceIcon v-if="recipe.outputs[0]" :resource-key="recipe.outputs[0].resource" size="md" class="flex-shrink-0 mt-0.5" />
          <div class="min-w-0">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <h4 class="text-sm font-semibold">
                <template v-if="recipe.isAlternate && recipe.baseName">
                  {{ recipe.baseName }} <span class="text-muted-foreground text-xs">({{ recipe.name }})</span>
                </template>
                <template v-else>
                  {{ recipe.name }}
                </template>
              </h4>
              <Badge v-if="recipe.isAlternate" variant="secondary" class="text-xs">
                ALT
              </Badge>
            </div>
            <p class="text-xs text-muted-foreground mb-2">{{ recipe.machine }}</p>
            <div class="text-xs text-muted-foreground space-y-0.5">
              <div v-for="(config, index) in productionLine.overclocking" :key="index" class="flex items-center gap-2 flex-wrap">
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
          </div>
        </div>

        <!-- Column 2: Inputs -->
        <div class="text-xs">
          <div class="text-muted-foreground mb-1.5 font-medium">Inputs</div>
          <div class="space-y-1">
            <div v-for="input in recipe.inputs" :key="input.resource" class="flex items-center gap-1.5">
              <ResourceIcon :resource-key="input.resource" size="sm" />
              <div class="flex flex-col">
                <span class="text-muted-foreground text-xs">{{ input.resource }}</span>
                <span class="text-destructive font-medium">{{ getCalculatedRate(input.resource, true).toFixed(1) }}/min</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-1.5 mt-2">
            <Zap class="h-4 w-4 text-chart-4" />
            <span class="text-chart-4 font-medium">{{ getTotalPower().toFixed(1) }} MW</span>
          </div>
        </div>

        <!-- Column 3: Outputs -->
        <div class="text-xs">
          <div class="text-muted-foreground mb-1.5 font-medium">Outputs</div>
          <div class="space-y-1">
            <div v-for="output in recipe.outputs" :key="output.resource" class="flex items-center gap-1.5">
              <ResourceIcon :resource-key="output.resource" size="sm" />
              <div class="flex flex-col">
                <span class="text-muted-foreground text-xs">{{ output.resource }}</span>
                <span class="text-chart-3 font-medium">{{ getCalculatedRate(output.resource, false).toFixed(1) }}/min</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Column 4: Actions -->
        <div class="flex items-start justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon" class="h-8 w-8">
                <MoreVertical class="h-4 w-4" />
                <span class="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end">
              <DropdownMenuItem @click="emit('edit', productionLine.id)">
                <Pencil class="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                class="text-destructive focus:text-destructive"
                @click="emit('delete', productionLine.id)"
              >
                <Trash2 class="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
    box-shadow: 0 0 0 2px rgb(168 85 247 / 0.15), 0 10px 15px -3px rgb(168 85 247 / 0.15);
  }
}

.somersloop-glow {
  animation: somersloop-pulse 5s ease-in-out infinite;
}
</style>
