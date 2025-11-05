<script setup lang="ts">
import { Download, Upload } from 'lucide-vue-next'
import { useLocations } from '@/composables/useLocations'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const { handleExport, handleImport } = useLocations()

const handleImportClick = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        await handleImport(file)
      } catch (error) {
        console.error('Import failed:', error)
        alert('Failed to import data. Please check the file format.')
      }
    }
  }
  input.click()
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton @click="handleExport">
        <Download />
        <span>Export Data</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <SidebarMenuButton @click="handleImportClick">
        <Upload />
        <span>Import Data</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
