<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { ResourceExtractionLine, OverclockingConfig } from '../../types/location'
import { useMiners } from '../../composables/useMiners'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  isOpen: boolean
  extractionLine?: ResourceExtractionLine | null
}>()

const emit = defineEmits<{
  close: []
  save: [line: Omit<ResourceExtractionLine, 'id'>]
}>()

const { allMiners, extractableResources } = useMiners()

// Sort resources alphabetically
const sortedExtractableResources = computed(() => {
  return [...extractableResources.value].sort((a, b) => a.name.localeCompare(b.name))
})

// Form state
const selectedMinerType = ref<string>('')
const selectedResourceType = ref<string>('')
const selectedPurity = ref<'impure' | 'normal' | 'pure'>('normal')
const overclockingConfigs = ref<OverclockingConfig[]>([
  { count: 1, percentage: 100 }
])

// Calculate total machine count
const totalMachineCount = computed(() => {
  return overclockingConfigs.value.reduce((sum, config) => sum + config.count, 0)
})

// Watch for modal open/close to reset or populate form
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.extractionLine) {
      // Edit mode - populate with existing data
      selectedMinerType.value = props.extractionLine.minerType
      selectedResourceType.value = props.extractionLine.resourceType
      selectedPurity.value = props.extractionLine.purity
      overclockingConfigs.value = props.extractionLine.overclocking.map(config => ({ ...config }))
    } else {
      // Add mode - reset form
      resetForm()
    }
  }
})

const resetForm = () => {
  selectedMinerType.value = ''
  selectedResourceType.value = ''
  selectedPurity.value = 'normal'
  overclockingConfigs.value = [{ count: 1, percentage: 100 }]
}

const addOverclockingConfig = () => {
  overclockingConfigs.value.push({ count: 1, percentage: 100 })
}

const removeOverclockingConfig = (index: number) => {
  if (overclockingConfigs.value.length > 1) {
    overclockingConfigs.value.splice(index, 1)
  }
}

const handleSave = () => {
  if (!selectedMinerType.value || !selectedResourceType.value || overclockingConfigs.value.length === 0) {
    return
  }

  // Filter out configs with 0 machines
  const validConfigs = overclockingConfigs.value.filter(config => config.count > 0)

  if (validConfigs.length === 0) {
    return
  }

  const machineCount = totalMachineCount.value

  emit('save', {
    minerType: selectedMinerType.value,
    resourceType: selectedResourceType.value,
    purity: selectedPurity.value,
    machineCount,
    overclocking: validConfigs
  })

  emit('close')
}

// Preset clock speeds
const presetClockSpeeds = [50, 100, 150, 200, 250]
</script>

<template>
  <Dialog :open="isOpen" @update:open="(open) => !open && emit('close')">
    <DialogContent class="max-w-2xl max-h-[90vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>
          {{ extractionLine ? 'Edit Resource Extraction' : 'Add Resource Extraction' }}
        </DialogTitle>
        <DialogDescription>
          Configure resource extraction with miners or extractors.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6 overflow-y-auto flex-1 pr-2">
        <!-- Miner Type Selector -->
        <div class="space-y-2">
          <Label for="miner-type">
            Miner/Extractor Type <span class="text-destructive">*</span>
          </Label>
          <Select v-model="selectedMinerType">
            <SelectTrigger id="miner-type">
              <SelectValue placeholder="Select miner type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="miner in allMiners"
                  :key="miner.key_name"
                  :value="miner.key_name"
                >
                  {{ miner.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <!-- Resource Type Selector -->
        <div class="space-y-2">
          <Label for="resource-type">
            Resource <span class="text-destructive">*</span>
          </Label>
          <Select v-model="selectedResourceType">
            <SelectTrigger id="resource-type">
              <SelectValue placeholder="Select resource..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="resource in sortedExtractableResources"
                  :key="resource.key_name"
                  :value="resource.key_name"
                >
                  {{ resource.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <!-- Node Purity Selector -->
        <div class="space-y-2">
          <Label for="purity">
            Node Purity <span class="text-destructive">*</span>
          </Label>
          <Select v-model="selectedPurity">
            <SelectTrigger id="purity">
              <SelectValue placeholder="Select purity..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="impure">Impure (50%)</SelectItem>
                <SelectItem value="normal">Normal (100%)</SelectItem>
                <SelectItem value="pure">Pure (200%)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <!-- Overclocking Configuration -->
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <Label>
              Overclocking Configuration <span class="text-destructive">*</span>
            </Label>
            <Button
              @click="addOverclockingConfig"
              variant="outline"
              size="sm"
            >
              + Add Config
            </Button>
          </div>

          <div class="space-y-3">
            <div
              v-for="(config, index) in overclockingConfigs"
              :key="index"
              class="flex items-center gap-3 p-3 rounded-lg border bg-card"
            >
              <div class="flex-1 space-y-2">
                <Label :for="`machine-count-${index}`" class="text-xs">Machine Count</Label>
                <Input
                  :id="`machine-count-${index}`"
                  v-model.number="config.count"
                  type="number"
                  min="1"
                />
              </div>

              <div class="flex-1 space-y-2">
                <Label :for="`clock-speed-${index}`" class="text-xs">Clock Speed (%)</Label>
                <Input
                  :id="`clock-speed-${index}`"
                  v-model.number="config.percentage"
                  type="number"
                  min="1"
                  max="250"
                />
              </div>

              <div class="flex-1 space-y-2">
                <Label class="text-xs">Presets</Label>
                <div class="flex gap-1">
                  <Button
                    v-for="speed in presetClockSpeeds"
                    :key="speed"
                    @click="config.percentage = speed"
                    variant="outline"
                    size="sm"
                    class="px-2 py-1 h-8 text-xs"
                  >
                    {{ speed }}
                  </Button>
                </div>
              </div>

              <Button
                v-if="overclockingConfigs.length > 1"
                @click="removeOverclockingConfig(index)"
                variant="ghost"
                size="icon"
                class="text-destructive mt-5"
              >
                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>

          <!-- Total machine count -->
          <div class="text-sm text-muted-foreground">
            Total Machines: <span class="font-semibold">{{ totalMachineCount }}</span>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="emit('close')">
          Cancel
        </Button>
        <Button
          @click="handleSave"
          :disabled="!selectedMinerType || !selectedResourceType || totalMachineCount === 0"
        >
          {{ extractionLine ? 'Update' : 'Add' }} Extraction Line
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
