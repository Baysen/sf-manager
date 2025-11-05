<script setup lang="ts">
import type { Location } from '@/types/location'
import { MapPin, Plus } from 'lucide-vue-next'
import { useLocations } from '@/composables/useLocations'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

defineProps<{
  locations: Location[]
}>()

const emit = defineEmits<{
  addLocation: []
}>()

const { activeLocationId } = useLocations()

const selectLocation = (locationId: string) => {
  activeLocationId.value = locationId
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
  </SidebarGroup>
</template>
