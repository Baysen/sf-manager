<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Location } from '@/types/location'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  open: boolean
  location: Location | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [name: string]
}>()

const locationName = ref('')

watch(() => props.location, (location) => {
  if (location) {
    locationName.value = location.name
  }
}, { immediate: true })

watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    locationName.value = ''
  }
})

const handleSave = () => {
  if (locationName.value.trim()) {
    emit('save', locationName.value.trim())
    emit('update:open', false)
  }
}

const handleCancel = () => {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Location</DialogTitle>
        <DialogDescription>
          Update the name of this location.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="location-name">Location Name</Label>
          <Input
            id="location-name"
            v-model="locationName"
            placeholder="Enter location name"
            @keyup.enter="handleSave"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleCancel">
          Cancel
        </Button>
        <Button @click="handleSave" :disabled="!locationName.trim()">
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
