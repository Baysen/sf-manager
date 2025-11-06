<script setup lang="ts">
import type { PowerGenerationLine } from '../../types/location';
import { usePowerGenerators, type PowerGenerator } from '../../composables/usePowerGenerators';
import { useCalculations } from '../../composables/useCalculations';
import { useRecipes } from '../../composables/useRecipes';
import ResourceIcon from '../common/ResourceIcon.vue';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Zap, Globe } from 'lucide-vue-next';

const props = defineProps<{
  powerLine: PowerGenerationLine;
  generator: PowerGenerator;
}>();

const emit = defineEmits<{
  edit: [id: string];
  delete: [id: string];
}>();

const { calculatePowerGeneration, calculateProductionRate } = useCalculations();
const { getRecipeById } = useRecipes();

const getTotalMachines = (line: PowerGenerationLine) => {
  return line.overclocking.reduce((sum, config) => sum + config.count, 0);
};

const getPowerGeneration = () => {
  return calculatePowerGeneration(props.generator, props.powerLine);
};

const getRecipe = () => {
  if (!props.powerLine.recipeId) return null;
  return getRecipeById(props.powerLine.recipeId);
};

const getRecipeName = () => {
  const recipe = getRecipe();
  return recipe?.name || props.generator.name;
};
</script>

<template>
  <Card class="hover:border-muted-foreground/50 transition-colors">
    <CardContent class="p-3">
      <div class="flex justify-between items-start mb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-md bg-chart-4/20 flex items-center justify-center">
            <Zap class="h-5 w-5 text-chart-4" />
          </div>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h4 class="text-base font-semibold">{{ getRecipeName() }}</h4>
              <Badge v-if="powerLine.connectedToGrid" variant="secondary" class="text-xs flex items-center gap-1">
                <Globe class="h-3 w-3" />
                Grid
              </Badge>
            </div>
            <p class="text-xs text-muted-foreground">
              {{ generator.name }} • {{ getTotalMachines(powerLine) }} machines
            </p>
          </div>
        </div>
        <div class="flex gap-1">
          <Button
            @click="emit('edit', powerLine.id)"
            variant="ghost"
            size="icon"
            class="h-8 w-8"
          >
            <Pencil class="h-4 w-4" />
          </Button>
          <Button
            @click="emit('delete', powerLine.id)"
            variant="ghost"
            size="icon"
            class="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div class="text-xs text-muted-foreground mb-3 space-y-0.5">
        <div v-for="(config, index) in powerLine.overclocking" :key="index">
          <span class="text-foreground">{{ config.count }}</span> @ <span class="text-chart-4">{{ config.percentage }}%</span>
        </div>
      </div>

      <!-- Variable power input for geothermal -->
      <div v-if="generator.type === 'geothermal' && generator.variable_power && powerLine.actualPower" class="mb-3 text-xs">
        <span class="text-muted-foreground">Actual Power/Generator:</span>
        <span class="text-chart-4 ml-1 font-medium">{{ powerLine.actualPower }} MW</span>
      </div>

      <!-- Fuel consumption and waste for fuel-based generators -->
      <div v-if="getRecipe()" class="mb-3 text-xs space-y-1">
        <div v-for="input in getRecipe()!.inputs" :key="input.resource" class="flex items-center justify-between">
          <span class="text-muted-foreground">{{ input.resource }}:</span>
          <span class="text-red-600 dark:text-red-400 font-medium">
            -{{ calculateProductionRate(getRecipe()!, powerLine as any, input.resource, true).toFixed(1) }}/min
          </span>
        </div>
        <div v-for="output in getRecipe()!.outputs" :key="output.resource" class="flex items-center justify-between">
          <span class="text-muted-foreground">{{ output.resource }}:</span>
          <span class="text-green-600 dark:text-green-400 font-medium">
            +{{ calculateProductionRate(getRecipe()!, powerLine as any, output.resource, false).toFixed(1) }}/min
          </span>
        </div>
      </div>

      <div class="flex items-center justify-between text-xs pt-3 border-t">
        <div>
          <span class="text-muted-foreground">Power Generation:</span>
          <span class="text-green-600 dark:text-green-400 ml-1 font-medium">{{ getPowerGeneration().toFixed(1) }} MW</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
