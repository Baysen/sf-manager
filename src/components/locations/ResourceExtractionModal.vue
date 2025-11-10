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

const { allMiners, extractableResources, getResourceByKeyName, getMinerByKeyName } = useMiners()

// Sort resources alphabetically
const sortedExtractableResources = computed(() => {
  return [...extractableResources.value].sort((a, b) => a.name.localeCompare(b.name))
})

// Form state
const selectedResourceType = ref<string>('')
const overclockingConfigs = ref<OverclockingConfig[]>([
  { count: 1, percentage: 100, minerType: '', purity: 'normal' }
])

// Extractor type detection
const isResourceWellPressurizer = (minerType: string | undefined) => {
  return minerType === 'resource-well-pressurizer'
}

const isWaterExtractor = (minerType: string | undefined) => {
  return minerType === 'water-extractor'
}

// Get compatible miners for selected resource
const getCompatibleMiners = computed(() => {
  if (!selectedResourceType.value) return []

  const resource = getResourceByKeyName(selectedResourceType.value)
  if (!resource) return []

  return allMiners.value
    .filter(miner => {
      if (miner.category === 'resource-well') {
        return resource.category === 'water' || resource.category === 'resource-well'
      }
      return miner.category === resource.category
    })
    .sort((a, b) => a.name.localeCompare(b.name))
})

// Calculate total machine count
const totalMachineCount = computed(() => {
  return overclockingConfigs.value.reduce((sum, config) => sum + config.count, 0)
})

// Watch for modal open/close
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.extractionLine) {
      selectedResourceType.value = props.extractionLine.resourceType
      overclockingConfigs.value = props.extractionLine.overclocking.map(config => ({ ...config }))
    } else {
      resetForm()
    }
  }
})

// Auto-select miner if only one compatible
watch(selectedResourceType, () => {
  const compatibleMiners = getCompatibleMiners.value
  if (compatibleMiners.length === 1) {
    for (const config of overclockingConfigs.value) {
      if (!config.minerType) {
        config.minerType = compatibleMiners[0]!.key_name
      }
    }
  }
})

// Auto-select miner for new configs
watch(() => overclockingConfigs.value.length, () => {
  const compatibleMiners = getCompatibleMiners.value
  if (compatibleMiners.length === 1) {
    const lastConfig = overclockingConfigs.value[overclockingConfigs.value.length - 1]
    if (lastConfig && !lastConfig.minerType) {
      lastConfig.minerType = compatibleMiners[0]!.key_name
    }
  }
})

// Handle extractor type changes
watch(() => overclockingConfigs.value.map(c => c.minerType), () => {
  for (const config of overclockingConfigs.value) {
    // Water extractors: force purity to normal
    if (isWaterExtractor(config.minerType)) {
      config.purity = 'normal'
      delete config.satellites
    }
    // Resource well pressurizers: initialize satellites if needed
    else if (isResourceWellPressurizer(config.minerType)) {
      if (!config.satellites || config.satellites.length === 0) {
        config.satellites = [{ purity: 'normal' }]
      }
      delete config.purity
    }
    // Regular extractors: ensure purity exists
    else if (config.minerType) {
      if (!config.purity) {
        config.purity = 'normal'
      }
      delete config.satellites
    }
  }
}, { deep: true })

const resetForm = () => {
  selectedResourceType.value = ''
  overclockingConfigs.value = [{ count: 1, percentage: 100, minerType: '', purity: 'normal' }]
}

const addOverclockingConfig = () => {
  overclockingConfigs.value.push({ count: 1, percentage: 100, minerType: '', purity: 'normal' })
}

const removeOverclockingConfig = (index: number) => {
  if (overclockingConfigs.value.length > 1) {
    overclockingConfigs.value.splice(index, 1)
  }
}

// Satellite management
const addSatellite = (config: OverclockingConfig) => {
  if (!config.satellites) config.satellites = []
  if (config.satellites.length < 8) {
    config.satellites.push({ purity: 'normal' })
  }
}

const removeSatellite = (config: OverclockingConfig, index: number) => {
  if (config.satellites && config.satellites.length > 1) {
    config.satellites.splice(index, 1)
  }
}

// Calculate extraction rate for preview
const calculateConfigRate = (config: OverclockingConfig): number => {
  if (!config.minerType) return 0

  const miner = getMinerByKeyName(config.minerType)
  if (!miner) return 0

  const speedMultiplier = config.percentage / 100

  if (isResourceWellPressurizer(config.minerType)) {
    // Sum satellite outputs
    const satelliteRate = (config.satellites || []).reduce((sum, sat) => {
      const purityMultiplier = sat.purity === 'impure' ? 0.5 : sat.purity === 'normal' ? 1 : 2
      return sum + (miner.base_rate * purityMultiplier)
    }, 0)
    return satelliteRate * config.count * speedMultiplier
  } else {
    // Regular extractor
    const purityMultiplier = config.purity === 'impure' ? 0.5 : config.purity === 'normal' ? 1 : 2
    return miner.base_rate * purityMultiplier * config.count * speedMultiplier
  }
}

// Calculate power consumption for preview
const calculateConfigPower = (config: OverclockingConfig): number => {
  if (!config.minerType) return 0

  const miner = getMinerByKeyName(config.minerType)
  if (!miner) return 0

  const speedMultiplier = config.percentage / 100
  const powerMultiplier = Math.pow(speedMultiplier, 1.6)
  return miner.power * config.count * powerMultiplier
}

const handleSave = () => {
  if (!selectedResourceType.value || overclockingConfigs.value.length === 0) {
    return
  }

  // Filter out invalid configs
  const validConfigs = overclockingConfigs.value.filter(config => {
    if (config.count <= 0 || !config.minerType) return false

    if (isResourceWellPressurizer(config.minerType)) {
      return config.satellites && config.satellites.length > 0
    } else {
      return !!config.purity
    }
  })

  if (validConfigs.length === 0) {
    return
  }

  const machineCount = validConfigs.reduce((sum, config) => sum + config.count, 0)

  emit('save', {
    resourceType: selectedResourceType.value,
    machineCount,
    overclocking: validConfigs
  })

  emit('close')
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="(open) => !open && emit('close')">
    <DialogContent class="sm:max-w-4xl max-h-[90vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>
          {{ extractionLine ? 'Edit Resource Extraction' : 'Add Resource Extraction' }}
        </DialogTitle>
        <DialogDescription>
          Configure resource extraction. You can add multiple miner types and purities for the same resource.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6 overflow-y-auto flex-1 pr-2">
        <!-- Resource Type Selector -->
        <div class="space-y-2">
          <Label for="resource-type">
            Resource <span class="text-destructive">*</span>
          </Label>
          <Select v-model="selectedResourceType">
            <SelectTrigger id="resource-type">
              <SelectValue placeholder="Select resource to extract..." />
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

        <!-- Extraction Configuration -->
        <div v-if="selectedResourceType" class="space-y-4">
          <div class="flex justify-between items-center">
            <Label>
              Extraction Configuration <span class="text-destructive">*</span>
            </Label>
            <Button
              @click="addOverclockingConfig"
              variant="outline"
              size="sm"
            >
              + Add Configuration
            </Button>
          </div>

          <div class="space-y-3">
            <div
              v-for="(config, index) in overclockingConfigs"
              :key="index"
              class="space-y-3 p-4 rounded-lg border bg-card"
            >
              <!-- Regular Extractor Configuration -->
              <template v-if="!isResourceWellPressurizer(config.minerType)">
                <div class="grid grid-cols-12 gap-3 items-end">
                  <!-- Count -->
                  <div class="col-span-2 space-y-2">
                    <Label :for="`count-${index}`" class="text-xs">Count</Label>
                    <Input
                      :id="`count-${index}`"
                      v-model.number="config.count"
                      type="number"
                      min="1"
                    />
                  </div>

                  <!-- Miner Type -->
                  <div class="col-span-3 space-y-2">
                    <Label :for="`miner-${index}`" class="text-xs">Miner Type</Label>
                    <Select v-model="config.minerType">
                      <SelectTrigger :id="`miner-${index}`">
                        <SelectValue placeholder="Select miner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem
                            v-for="miner in getCompatibleMiners"
                            :key="miner.key_name"
                            :value="miner.key_name"
                          >
                            {{ miner.name }}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <!-- Purity -->
                  <div class="col-span-2 space-y-2">
                    <Label :for="`purity-${index}`" class="text-xs">Purity</Label>
                    <Select
                      v-model="config.purity"
                      :disabled="isWaterExtractor(config.minerType)"
                    >
                      <SelectTrigger :id="`purity-${index}`">
                        <SelectValue placeholder="Purity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="impure">Impure</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="pure">Pure</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <!-- Clock Speed -->
                  <div class="col-span-2 space-y-2">
                    <Label :for="`clock-${index}`" class="text-xs">Clock %</Label>
                    <Input
                      :id="`clock-${index}`"
                      v-model.number="config.percentage"
                      type="number"
                      min="1"
                      max="250"
                    />
                  </div>

                  <!-- Presets -->
                  <div class="col-span-2 space-y-2">
                    <Label class="text-xs">Presets</Label>
                    <div class="flex gap-1 flex-wrap">
                      <Button
                        v-for="speed in [100, 250]"
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

                  <!-- Delete Button -->
                  <div class="col-span-1 flex justify-end">
                    <Button
                      v-if="overclockingConfigs.length > 1"
                      @click="removeOverclockingConfig(index)"
                      variant="ghost"
                      size="icon"
                      class="text-destructive"
                    >
                      <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                </div>

                <!-- Water extractor note -->
                <p v-if="isWaterExtractor(config.minerType)" class="text-xs text-muted-foreground">
                  Water Extractors have fixed output (120/min at 100%) regardless of placement.
                </p>
              </template>

              <!-- Resource Well Pressurizer Configuration -->
              <template v-else>
                <div class="space-y-3">
                  <!-- Pressurizer Header -->
                  <div class="grid grid-cols-12 gap-3 items-end">
                    <!-- Count -->
                    <div class="col-span-2 space-y-2">
                      <Label :for="`count-${index}`" class="text-xs">Pressurizers</Label>
                      <Input
                        :id="`count-${index}`"
                        v-model.number="config.count"
                        type="number"
                        min="1"
                      />
                    </div>

                    <!-- Miner Type (read-only display) -->
                    <div class="col-span-4 space-y-2">
                      <Label class="text-xs">Type</Label>
                      <div class="px-3 py-2 border rounded-md bg-muted text-sm">
                        Resource Well Pressurizer
                      </div>
                    </div>

                    <!-- Clock Speed -->
                    <div class="col-span-2 space-y-2">
                      <Label :for="`clock-${index}`" class="text-xs">Clock %</Label>
                      <Input
                        :id="`clock-${index}`"
                        v-model.number="config.percentage"
                        type="number"
                        min="1"
                        max="250"
                      />
                    </div>

                    <!-- Presets -->
                    <div class="col-span-3 space-y-2">
                      <Label class="text-xs">Presets</Label>
                      <div class="flex gap-1">
                        <Button
                          v-for="speed in [100, 250]"
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

                    <!-- Delete Button -->
                    <div class="col-span-1 flex justify-end">
                      <Button
                        v-if="overclockingConfigs.length > 1"
                        @click="removeOverclockingConfig(index)"
                        variant="ghost"
                        size="icon"
                        class="text-destructive"
                      >
                        <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </div>
                  </div>

                  <!-- Satellites Section -->
                  <div class="ml-4 pl-4 border-l-2 space-y-2">
                    <div class="flex justify-between items-center">
                      <Label class="text-xs">Satellite Nodes (max 8)</Label>
                      <Button
                        @click="addSatellite(config)"
                        :disabled="(config.satellites?.length || 0) >= 8"
                        variant="outline"
                        size="sm"
                        class="h-7 text-xs"
                      >
                        + Add Satellite
                      </Button>
                    </div>

                    <div class="space-y-2">
                      <div
                        v-for="(satellite, satIndex) in config.satellites"
                        :key="satIndex"
                        class="flex gap-2 items-center"
                      >
                        <span class="text-xs text-muted-foreground w-16">Node {{ satIndex + 1 }}</span>
                        <Select v-model="satellite.purity" class="flex-1">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="impure">Impure (30/min)</SelectItem>
                              <SelectItem value="normal">Normal (60/min)</SelectItem>
                              <SelectItem value="pure">Pure (120/min)</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <Button
                          v-if="(config.satellites?.length || 0) > 1"
                          @click="removeSatellite(config, satIndex)"
                          variant="ghost"
                          size="icon"
                          class="h-8 w-8 text-destructive"
                        >
                          <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Per-Config Calculations -->
              <div v-if="config.minerType" class="pt-2 border-t border-border/50 text-xs">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <div class="text-muted-foreground mb-1">Extraction Rate</div>
                    <div class="flex items-center gap-1.5">
                      <span class="text-chart-3 font-medium">
                        {{ calculateConfigRate(config).toFixed(2) }}/min
                      </span>
                    </div>
                  </div>
                  <div>
                    <div class="text-muted-foreground mb-1">Power Consumption</div>
                    <div class="flex items-center gap-1.5">
                      <span class="text-chart-4 font-medium">
                        {{ calculateConfigPower(config).toFixed(2) }} MW
                      </span>
                    </div>
                  </div>
                </div>
              </div>
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
          :disabled="!selectedResourceType || totalMachineCount === 0"
        >
          {{ extractionLine ? 'Update' : 'Add' }} Extraction Line
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
