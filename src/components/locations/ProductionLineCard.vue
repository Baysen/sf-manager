<script setup lang="ts">
import type { ProductionLine } from '../../types/location';
import type { Recipe } from '../../types/recipe';
import { useCalculations } from '../../composables/useCalculations';
import ResourceIcon from '../common/ResourceIcon.vue';

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
  <div class="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors">
    <div class="flex justify-between items-start mb-2">
      <div>
        <h4 class="text-base font-semibold text-white">{{ recipe.name }}</h4>
        <p class="text-xs text-gray-400">{{ recipe.machine }} • {{ getTotalMachines(productionLine) }} machines</p>
      </div>
      <div class="flex space-x-2">
        <button
          @click="emit('edit', productionLine.id)"
          class="px-2 py-1 text-xs font-medium text-blue-400 hover:text-blue-300 border border-blue-400 rounded hover:border-blue-300 transition-colors"
        >
          Edit
        </button>
        <button
          @click="emit('delete', productionLine.id)"
          class="px-2 py-1 text-xs font-medium text-red-400 hover:text-red-300 border border-red-400 rounded hover:border-red-300 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>

    <div class="text-xs text-gray-400 mb-2 space-y-0.5">
      <div v-for="(config, index) in productionLine.overclocking" :key="index">
        <span class="text-white">{{ config.count }}</span> @ <span class="text-yellow-400">{{ config.percentage }}%</span>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-gray-700">
      <div>
        <div class="text-gray-400 mb-1">In:</div>
        <div class="space-y-0.5">
          <div v-for="input in recipe.inputs" :key="input.resource" class="flex items-center gap-1">
            <ResourceIcon :resource-key="input.resource" size="sm" />
            <span class="text-red-400">{{ getCalculatedRate(input.resource, true).toFixed(1) }}/min</span>
          </div>
        </div>
      </div>
      <div>
        <div class="text-gray-400 mb-1">Out:</div>
        <div class="space-y-0.5">
          <div v-for="output in recipe.outputs" :key="output.resource" class="flex items-center gap-1">
            <ResourceIcon :resource-key="output.resource" size="sm" />
            <span class="text-green-400">{{ getCalculatedRate(output.resource, false).toFixed(1) }}/min</span>
          </div>
        </div>
      </div>
      <div class="text-right">
        <div class="text-gray-400 mb-1">Power:</div>
        <span class="text-yellow-400">{{ getTotalPower().toFixed(1) }} MW</span>
      </div>
    </div>
  </div>
</template>
