<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { ProductionLine, OverclockingConfig } from '../../types/location'
import { useRecipes } from '../../composables/useRecipes'
import ResourceIcon from '../common/ResourceIcon.vue'

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
import { CornerDownRight } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  productionLine?: ProductionLine | null
}>()

const emit = defineEmits<{
  close: []
  save: [line: Omit<ProductionLine, 'id'>]
}>()

const { allRecipes } = useRecipes()

// Form state
const selectedOutputResource = ref<string>('')
const selectedRecipeId = ref<string>('')
const overclockingConfigs = ref<OverclockingConfig[]>([
  { count: 1, percentage: 100, somersloops: 0 }
])

// Get unique output resources (alphabetically sorted)
const outputResources = computed(() => {
  const resources = new Set<string>()
  allRecipes.value.forEach(recipe => {
    recipe.outputs.forEach(output => {
      resources.add(output.resource)
    })
  })
  return Array.from(resources).sort()
})

// Recipes filtered by selected output resource
const filteredRecipes = computed(() => {
  if (!selectedOutputResource.value) return []
  return allRecipes.value.filter(recipe =>
    recipe.outputs.some(output => output.resource === selectedOutputResource.value)
  )
})

// Selected recipe details
const selectedRecipe = computed(() => {
  if (!selectedRecipeId.value) return null
  return allRecipes.value.find(r => r.id === selectedRecipeId.value) || null
})

// Watch for output resource change to reset recipe selection
watch(selectedOutputResource, () => {
  selectedRecipeId.value = ''
})

// Calculate total machine count
const totalMachineCount = computed(() => {
  return overclockingConfigs.value.reduce((sum, config) => sum + config.count, 0)
})

// Watch for modal open/close to reset or populate form
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.productionLine) {
      // Edit mode - populate with existing data
      const line = props.productionLine
      overclockingConfigs.value = line.overclocking.map(config => ({
        ...config,
        somersloops: config.somersloops || 0
      }))

      // Find and set the output resource for this recipe
      const recipe = allRecipes.value.find(r => r.id === line.recipeId)
      const firstOutput = recipe?.outputs?.[0]
      if (firstOutput) {
        selectedOutputResource.value = firstOutput.resource
        selectedRecipeId.value = line.recipeId
      }
    } else {
      // Add mode - reset form
      resetForm()
    }
  }
})

const resetForm = () => {
  selectedOutputResource.value = ''
  selectedRecipeId.value = ''
  overclockingConfigs.value = [{ count: 1, percentage: 100, somersloops: 0 }]
}

const addOverclockingConfig = () => {
  overclockingConfigs.value.push({ count: 1, percentage: 100, somersloops: 0 })
}

const removeOverclockingConfig = (index: number) => {
  if (overclockingConfigs.value.length > 1) {
    overclockingConfigs.value.splice(index, 1)
  }
}

const handleSave = () => {
  if (!selectedRecipeId.value || overclockingConfigs.value.length === 0) {
    return
  }

  // Filter out configs with 0 machines
  const validConfigs = overclockingConfigs.value.filter(config => config.count > 0)

  if (validConfigs.length === 0) {
    return
  }

  const machineCount = totalMachineCount.value

  emit('save', {
    recipeId: selectedRecipeId.value,
    machineCount,
    overclocking: validConfigs
  })

  emit('close')
}

// Preset clock speeds
const presetClockSpeeds = [50, 100, 150, 200, 250]

// Get somersloop presets based on selected recipe
const getSomersloopPresets = computed(() => {
  if (!selectedRecipe.value || selectedRecipe.value.somersloopSlots === null) {
    return []
  }
  const max = selectedRecipe.value.somersloopSlots
  return Array.from({ length: max + 1 }, (_, i) => i)
})
</script>

<template>
  <Dialog :open="isOpen" @update:open="(open) => !open && emit('close')">
    <DialogContent class="sm:max-w-2xl max-h-[90vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>
          {{ productionLine ? 'Edit Production Line' : 'Add Production Line' }}
        </DialogTitle>
        <DialogDescription>
          Select a resource to produce and configure the production line settings.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6 overflow-y-auto flex-1 pr-2">
        <!-- Output Resource Selector -->
        <div class="space-y-2">
          <Label for="output-resource">
            Output Resource <span class="text-destructive">*</span>
          </Label>
          <Select v-model="selectedOutputResource">
            <SelectTrigger id="output-resource">
              <SelectValue placeholder="Select output resource..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="resource in outputResources"
                  :key="resource"
                  :value="resource"
                >
                  {{ resource }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <!-- Recipe Selector -->
        <div v-if="selectedOutputResource" class="space-y-2">
          <Label for="recipe">
            Recipe <span class="text-destructive">*</span>
          </Label>
          <Select v-model="selectedRecipeId">
            <SelectTrigger id="recipe">
              <SelectValue placeholder="Select a recipe..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="recipe in filteredRecipes"
                  :key="recipe.id"
                  :value="recipe.id"
                >
                  <div class="flex items-center gap-2">
                    <CornerDownRight v-if="recipe.isAlternate" class="size-4 text-muted-foreground" />
                    <span>{{ recipe.name }} - {{ recipe.machine }}</span>
                    <span v-if="recipe.isAlternate" class="text-xs text-muted-foreground">(Alternate)</span>
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <!-- Selected recipe details -->
          <div v-if="selectedRecipe" class="mt-4 p-4 rounded-lg border bg-card">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-xs text-muted-foreground mb-2">Inputs</div>
                <div class="space-y-1">
                  <div v-for="input in selectedRecipe.inputs" :key="input.resource" class="text-sm flex items-center gap-2">
                    <ResourceIcon :resource-key="input.resource" size="sm" />
                    <span>{{ input.resource }}:</span>
                    <span class="text-destructive">{{ input.amount }}/min</span>
                  </div>
                </div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground mb-2">Outputs</div>
                <div class="space-y-1">
                  <div v-for="output in selectedRecipe.outputs" :key="output.resource" class="text-sm flex items-center gap-2">
                    <ResourceIcon :resource-key="output.resource" size="sm" />
                    <span>{{ output.resource }}:</span>
                    <span class="text-green-500">{{ output.amount }}/min</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-3 text-sm text-muted-foreground">
              Power: <span class="text-yellow-500">{{ selectedRecipe.powerConsumption }} MW</span> per machine at 100%
            </div>
          </div>
        </div>

        <!-- Overclocking & Somersloop Configuration -->
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
              class="space-y-3 p-3 rounded-lg border bg-card"
            >
              <div class="flex items-center gap-3">
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
                  <Label class="text-xs">Clock Presets</Label>
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

              <!-- Somersloop Configuration for this overclocking config -->
              <div v-if="getSomersloopPresets.length > 0" class="pt-2 border-t border-border/50">
                <div class="space-y-2">
                  <Label class="text-xs">Somersloops</Label>
                  <div class="flex gap-2 flex-wrap">
                    <Button
                      v-for="count in getSomersloopPresets"
                      :key="count"
                      @click="config.somersloops = count"
                      :variant="config.somersloops === count ? 'default' : 'outline'"
                      size="sm"
                      class="p-1 h-auto"
                    >
                      <template v-if="count === 0">
                        <span class="px-2">0</span>
                      </template>
                      <template v-else>
                        <div class="flex gap-0">
                          <img
                            v-for="slot in selectedRecipe!.somersloopSlots"
                            :key="slot"
                            src="/icons/Somersloop.png"
                            alt="Somersloop"
                            class="w-6 h-6"
                            :class="slot <= count ? '' : 'opacity-30'"
                          />
                        </div>
                      </template>
                    </Button>
                  </div>
                </div>
                <div v-if="config.somersloops && config.somersloops > 0 && selectedRecipe?.somersloopSlots" class="text-xs text-muted-foreground mt-2">
                  Production: <span class="text-green-500 font-semibold">{{ ((1 + config.somersloops / selectedRecipe.somersloopSlots) * 100).toFixed(0) }}%</span>
                  <span class="mx-2">•</span>
                  Power: <span class="text-yellow-500 font-semibold">{{ Math.pow(2, config.somersloops).toFixed(1) }}x</span>
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
          :disabled="!selectedOutputResource || !selectedRecipeId || totalMachineCount === 0"
        >
          {{ productionLine ? 'Update' : 'Add' }} Production Line
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
