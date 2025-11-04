<script setup lang="ts">
import type { ProductionLine } from '../../types/location';
import type { Recipe } from '../../types/recipe';
import { useCalculations } from '../../composables/useCalculations';

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

    <div class="flex items-center justify-between text-xs pt-2 border-t border-gray-700">
      <div class="flex-1">
        <span class="text-gray-400">In:</span>
        <span v-for="(input, index) in recipe.inputs" :key="input.resource">
          <span v-if="index > 0" class="text-gray-600">, </span>
          <span class="text-white">{{ input.resource }}</span> <span class="text-red-400">{{ getCalculatedRate(input.resource, true).toFixed(1) }}/min</span>
        </span>
      </div>
      <div class="flex-1 text-center">
        <span class="text-gray-400">Out:</span>
        <span v-for="(output, index) in recipe.outputs" :key="output.resource">
          <span v-if="index > 0" class="text-gray-600">, </span>
          <span class="text-white">{{ output.resource }}</span> <span class="text-green-400">{{ getCalculatedRate(output.resource, false).toFixed(1) }}/min</span>
        </span>
      </div>
      <div class="flex-1 text-right">
        <span class="text-gray-400">Power:</span>
        <span class="text-yellow-400 ml-1">{{ getTotalPower().toFixed(1) }} MW</span>
      </div>
    </div>
  </div>
</template>
