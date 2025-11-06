<script setup lang="ts">
import { ref } from 'vue'
import type { Location } from '@/types/location'
import { MapPin, Plus, MoreVertical, Pencil, Trash2 } from 'lucide-vue-next'
import { useLocations } from '@/composables/useLocations'
import LocationEditModal from '@/components/locations/LocationEditModal.vue'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

defineProps<{
  locations: Location[]
}>()

const emit = defineEmits<{
  addLocation: []
}>()

const { activeLocationId, updateLocation, deleteLocation } = useLocations()

const selectLocation = (locationId: string) => {
  activeLocationId.value = locationId
}

// Edit modal state
const editModalOpen = ref(false)
const editingLocation = ref<Location | null>(null)

const openEditModal = (location: Location) => {
  editingLocation.value = location
  editModalOpen.value = true
}

const handleSaveEdit = (name: string) => {
  if (editingLocation.value) {
    updateLocation(editingLocation.value.id, { name })
    editingLocation.value = null
  }
}

// Delete confirmation state
const deleteDialogOpen = ref(false)
const deletingLocation = ref<Location | null>(null)

const openDeleteDialog = (location: Location) => {
  deletingLocation.value = location
  deleteDialogOpen.value = true
}

const handleConfirmDelete = () => {
  if (deletingLocation.value) {
    deleteLocation(deletingLocation.value.id)
    deletingLocation.value = null
    deleteDialogOpen.value = false
  }
}
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>Your Locations</SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem v-for="location in locations" :key="location.id">
        <SidebarMenuButton
          :is-active="activeLocationId === location.id"
          @click="selectLocation(location.id)"
        >
          <MapPin />
          <span>{{ location.name }}</span>
        </SidebarMenuButton>

        <!-- Dropdown Menu for Edit/Delete -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <SidebarMenuAction show-on-hover>
              <MoreVertical />
              <span class="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="end"
          >
            <DropdownMenuItem @click="openEditModal(location)">
              <Pencil class="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              class="text-destructive focus:text-destructive"
              @click="openDeleteDialog(location)"
            >
              <Trash2 class="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <!-- Add Location Button -->
      <SidebarMenuItem>
        <SidebarMenuButton
          class="text-sidebar-foreground/70"
          @click="emit('addLocation')"
        >
          <Plus class="text-sidebar-foreground/70" />
          <span>Add Location</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>

    <!-- Edit Location Modal -->
    <LocationEditModal
      v-model:open="editModalOpen"
      :location="editingLocation"
      @save="handleSaveEdit"
    />

    <!-- Delete Confirmation Dialog -->
    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the location "{{ deletingLocation?.name }}" and all its production lines, resource extractions, and exports. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            @click="handleConfirmDelete"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </SidebarGroup>
</template>
