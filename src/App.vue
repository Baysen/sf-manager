<script setup lang="ts">
import { ref } from 'vue'
import { useLocations } from './composables/useLocations'
import AppSidebar from './components/AppSidebar.vue'
import LocationView from './components/locations/LocationView.vue'
import RecipesView from './components/recipes/RecipesView.vue'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const activeView = ref<'locations' | 'recipes'>('locations')
const { addLocation } = useLocations()

// Add location dialog state
const showAddLocationDialog = ref(false)
const newLocationName = ref('')

const handleViewChange = (view: 'locations' | 'recipes') => {
  activeView.value = view
}

const openAddLocationDialog = () => {
  showAddLocationDialog.value = true
  newLocationName.value = ''
}

const handleAddLocation = () => {
  if (newLocationName.value.trim()) {
    addLocation(newLocationName.value.trim())
    showAddLocationDialog.value = false
    newLocationName.value = ''
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleAddLocation()
  }
}
</script>

<template>
  <SidebarProvider>
    <AppSidebar
      :active-view="activeView"
      @view-change="handleViewChange"
      @add-location="openAddLocationDialog"
    />
    <SidebarInset>
      <div class="flex flex-1 flex-col">
        <LocationView v-if="activeView === 'locations'" />
        <RecipesView v-else-if="activeView === 'recipes'" />
      </div>
    </SidebarInset>

    <!-- Add Location Dialog -->
    <Dialog v-model:open="showAddLocationDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
          <DialogDescription>
            Create a new factory location to track production lines and resources.
          </DialogDescription>
        </DialogHeader>

        <div class="py-4">
          <Input
            v-model="newLocationName"
            placeholder="Location name (e.g., Iron Smelting Complex)"
            @keydown="handleKeydown"
            autofocus
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            @click="showAddLocationDialog = false"
          >
            Cancel
          </Button>
          <Button
            @click="handleAddLocation"
            :disabled="!newLocationName.trim()"
          >
            Add Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </SidebarProvider>
</template>
