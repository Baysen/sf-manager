<script setup lang="ts">
import { ref } from 'vue';
import AppNavigation from './components/common/AppNavigation.vue';
import LocationTabs from './components/locations/LocationTabs.vue';
import LocationView from './components/locations/LocationView.vue';
import RecipesView from './components/recipes/RecipesView.vue';
import { useLocations } from './composables/useLocations';

const activeView = ref<'locations' | 'recipes'>('locations');
const { locations, activeLocationId, addLocation } = useLocations();

const handleTabChange = (tab: 'locations' | 'recipes') => {
  activeView.value = tab;
};

const handleSelectLocation = (id: string) => {
  activeLocationId.value = id;
};

const handleAddLocation = (name: string) => {
  addLocation(name);
};
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-gray-100">
    <AppNavigation @tab-change="handleTabChange" />

    <div v-if="activeView === 'locations'">
      <LocationTabs
        :locations="locations"
        :active-location-id="activeLocationId"
        @select-location="handleSelectLocation"
        @add-location="handleAddLocation"
      />
      <LocationView />
    </div>

    <div v-else-if="activeView === 'recipes'">
      <RecipesView />
    </div>
  </div>
</template>

