<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'
import { Factory, BookOpen } from 'lucide-vue-next'
import { computed } from 'vue'
import { useLocations } from '@/composables/useLocations'
import NavLocations from '@/components/NavLocations.vue'
import NavFooter from '@/components/NavFooter.vue'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps & {
  activeView: 'locations' | 'recipes'
}>(), {
  collapsible: 'icon',
})

const emit = defineEmits<{
  viewChange: [view: 'locations' | 'recipes']
  addLocation: []
}>()

const { locations } = useLocations()

// Sort locations alphabetically by name
const sortedLocations = computed(() => {
  return [...locations.value].sort((a, b) => a.name.localeCompare(b.name))
})

// Data for navigation
const data = computed(() => ({
  navigation: [
    {
      title: 'Locations',
      icon: Factory,
      view: 'locations' as const,
      isActive: props.activeView === 'locations',
    },
    {
      title: 'Available Recipes',
      icon: BookOpen,
      view: 'recipes' as const,
      isActive: props.activeView === 'recipes',
    },
  ],
}))
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
            <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Factory class="size-4" />
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">Satisfactory</span>
              <span class="truncate text-xs">Factory Manager</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <!-- Main Navigation -->
      <SidebarMenu>
        <SidebarMenuItem v-for="item in data.navigation" :key="item.view">
          <SidebarMenuButton
            :is-active="item.isActive"
            @click="emit('viewChange', item.view)"
          >
            <component :is="item.icon" />
            <span>{{ item.title }}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <SidebarSeparator class="mx-0" />

      <!-- Locations List (only shown when Locations view is active) -->
      <NavLocations
        v-if="activeView === 'locations'"
        :locations="sortedLocations"
        @add-location="emit('addLocation')"
      />
    </SidebarContent>

    <SidebarFooter>
      <NavFooter />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>
