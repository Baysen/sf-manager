<script setup lang="ts">
import { computed } from 'vue';
import type { PowerGenerationLine, ResourceBalance } from '../../types/location';
import { usePowerGenerators, type PowerGenerator } from '../../composables/usePowerGenerators';
import { useCalculations } from '../../composables/useCalculations';
import { useRecipes } from '../../composables/useRecipes';
import ResourceIcon from '../common/ResourceIcon.vue';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Pencil, Trash2, Zap, Globe, TriangleAlert } from 'lucide-vue-next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatRate } from '@/lib/formatters';

const props = defineProps<{
  powerLine: PowerGenerationLine;
  generator: PowerGenerator;
  resourceBalances: ResourceBalance[];
}>();

const emit = defineEmits<{
  edit: [id: string];
  delete: [id: string];
}>();

const { calculatePowerGeneration, calculateProductionRate, calculateLineResourceAvailability } = useCalculations();
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

const resourceAvailabilities = computed(() => {
  const recipe = getRecipe();
  if (!recipe) return [];
  return calculateLineResourceAvailability(props.powerLine as any, recipe, props.resourceBalances);
});

const getAvailability = (resourceName: string) => {
  return resourceAvailabilities.value.find(ra => ra.resource === resourceName);
};
</script>

<template>
  <Card class="hover:border-muted-foreground/50 transition-colors">
    <CardContent class="p-3">
      <div class="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 items-start">
        <!-- Column 1: Icon, Name, Generator, Configs -->
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-md bg-chart-4/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Zap class="h-5 w-5 text-chart-4" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <h4 class="text-sm font-semibold">{{ getRecipeName() }}</h4>
              <Badge v-if="powerLine.connectedToGrid" variant="secondary" class="text-xs flex items-center gap-1">
                <Globe class="h-3 w-3" />
                Grid
              </Badge>
            </div>
            <p class="text-xs text-muted-foreground mb-2">{{ generator.name }}</p>
            <div class="text-xs text-muted-foreground space-y-0.5">
              <div v-for="(config, index) in powerLine.overclocking" :key="index">
                <span class="text-foreground">{{ config.count }}</span> @ <span class="text-foreground">{{ config.percentage }}%</span>
              </div>
            </div>
            <!-- Variable power input for geothermal -->
            <div v-if="generator.type === 'geothermal' && generator.variable_power && powerLine.actualPower" class="mt-2 text-xs pt-2 border-t border-border/50">
              <span class="text-muted-foreground">Actual:</span>
              <span class="ml-1 font-medium">{{ powerLine.actualPower }} MW</span>
            </div>
          </div>
        </div>

        <!-- Column 2: Fuel Inputs (for fuel-based generators) -->
        <div class="text-xs">
          <div class="text-muted-foreground mb-1.5 font-medium">Inputs</div>
          <div v-if="getRecipe()" class="space-y-1">
            <div v-for="input in getRecipe()!.inputs" :key="input.resource" class="flex items-center gap-1.5">
              <ResourceIcon :resource-key="input.resource" size="sm" />
              <div class="flex flex-col">
                <span class="text-muted-foreground text-xs">{{ input.resource }}</span>
                <div class="flex items-center gap-1">
                  <span
                    v-if="getAvailability(input.resource)"
                    :class="[
                      'font-medium',
                      getAvailability(input.resource)!.hasDeficit ? 'text-destructive' : ''
                    ]"
                  >
                    {{ formatRate(getAvailability(input.resource)!.available) }} / {{ formatRate(getAvailability(input.resource)!.needed) }}
                  </span>
                  <span v-else class="font-medium">
                    {{ formatRate(calculateProductionRate(getRecipe()!, powerLine as any, input.resource, true)) }} / min
                  </span>
                  <TriangleAlert
                    v-if="getAvailability(input.resource)?.hasDeficit"
                    class="h-3 w-3 text-destructive"
                  />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-muted-foreground text-xs">—</div>
        </div>

        <!-- Column 3: Power Output + Waste (for nuclear) -->
        <div class="text-xs">
          <div class="text-muted-foreground mb-1.5 font-medium">Output</div>
          <div class="flex items-center gap-1.5 mb-2">
            <Zap class="h-4 w-4 text-muted-foreground" />
            <span class="font-medium">{{ formatRate(getPowerGeneration()) }} MW</span>
          </div>
          <!-- Waste products (e.g., Uranium Waste) -->
          <div v-if="getRecipe() && getRecipe()!.outputs.length > 0" class="space-y-1">
            <div v-for="output in getRecipe()!.outputs" :key="output.resource" class="flex items-center gap-1.5">
              <ResourceIcon :resource-key="output.resource" size="sm" />
              <div class="flex flex-col">
                <span class="text-muted-foreground text-xs">{{ output.resource }}</span>
                <span class="font-medium">
                  {{ formatRate(calculateProductionRate(getRecipe()!, powerLine as any, output.resource, false)) }}
                </span>
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
              <DropdownMenuItem @click="emit('edit', powerLine.id)">
                <Pencil class="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                class="text-destructive focus:text-destructive"
                @click="emit('delete', powerLine.id)"
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
