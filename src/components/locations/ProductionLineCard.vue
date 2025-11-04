<script setup lang="ts">
import type { ProductionLine } from '../../types/location';
import type { Recipe } from '../../types/recipe';

defineProps<{
  productionLine: ProductionLine;
  recipe: Recipe;
}>();

const emit = defineEmits<{
  edit: [id: string];
  delete: [id: string];
}>();

const getTotalMachines = (line: ProductionLine) => {
  return line.overclocking.reduce((sum, config) => sum + config.count, 0);
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
    <div class="flex justify-between items-start mb-3">
      <div>
        <h4 class="text-lg font-semibold text-white">{{ recipe.name }}</h4>
        <p class="text-sm text-gray-400">{{ recipe.machine }}</p>
      </div>
      <div class="flex space-x-2">
        <button
          @click="emit('edit', productionLine.id)"
          class="px-3 py-1 text-xs font-medium text-blue-400 hover:text-blue-300 border border-blue-400 rounded hover:border-blue-300 transition-colors"
        >
          Edit
        </button>
        <button
          @click="emit('delete', productionLine.id)"
          class="px-3 py-1 text-xs font-medium text-red-400 hover:text-red-300 border border-red-400 rounded hover:border-red-300 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>

    <div class="space-y-2 mb-3">
      <div class="text-sm">
        <span class="text-gray-400">Total Machines:</span>
        <span class="text-white ml-2 font-medium">{{ getTotalMachines(productionLine) }}</span>
      </div>

      <div class="text-sm">
        <span class="text-gray-400">Overclocking:</span>
        <div class="mt-1 space-y-1">
          <div v-for="(config, index) in productionLine.overclocking" :key="index" class="ml-2">
            <span class="text-white">{{ config.count }} machines</span>
            <span class="text-gray-400"> at </span>
            <span class="text-yellow-400 font-medium">{{ config.percentage }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 pt-3 border-t border-gray-700">
      <div>
        <div class="text-xs text-gray-400 mb-1">Inputs</div>
        <div class="space-y-1">
          <div v-for="input in recipe.inputs" :key="input.resource" class="text-sm">
            <span class="text-white">{{ input.resource }}:</span>
            <span class="text-red-400 ml-1">{{ input.amount }}/min</span>
          </div>
        </div>
      </div>
      <div>
        <div class="text-xs text-gray-400 mb-1">Outputs</div>
        <div class="space-y-1">
          <div v-for="output in recipe.outputs" :key="output.resource" class="text-sm">
            <span class="text-white">{{ output.resource }}:</span>
            <span class="text-green-400 ml-1">{{ output.amount }}/min</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
