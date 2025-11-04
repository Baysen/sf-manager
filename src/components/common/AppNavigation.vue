<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref<'locations' | 'recipes'>('locations');

const emit = defineEmits<{
  tabChange: [tab: 'locations' | 'recipes']
}>();

const handleTabChange = (tab: 'locations' | 'recipes') => {
  activeTab.value = tab;
  emit('tabChange', tab);
};
</script>

<template>
  <nav class="bg-gray-800 border-b border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <h1 class="text-xl font-bold text-white">Satisfactory Factory Manager</h1>
          </div>
          <div class="ml-10">
            <div class="flex space-x-4">
              <button
                @click="handleTabChange('locations')"
                :class="[
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  activeTab === 'locations'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                ]"
              >
                Locations
              </button>
              <button
                @click="handleTabChange('recipes')"
                :class="[
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  activeTab === 'recipes'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                ]"
              >
                Available Recipes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
