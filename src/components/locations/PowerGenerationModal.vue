<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { PowerGenerationLine, OverclockingConfig } from '../../types/location'
import { usePowerGenerators } from '../../composables/usePowerGenerators'

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
import { Checkbox } from '@/components/ui/checkbox'

const props = defineProps<{
  isOpen: boolean
  powerLine?: PowerGenerationLine | null
}>()

const emit = defineEmits<{
  close: []
  save: [line: Omit<PowerGenerationLine, 'id'>]
}>()

const { allPowerGenerators, getRecipesForGenerator, isFuelBased, isGeothermal, hasVariablePower } = usePowerGenerators()

// Form state
const selectedGeneratorType = ref<string>('')
const selectedRecipeId = ref<string>('')
const connectedToGrid = ref<boolean>(true)
const actualPower = ref<number | undefined>(undefined)
const overclockingConfigs = ref<OverclockingConfig[]>([
  { count: 1, percentage: 100 }
])

// Calculate total machine count
const totalMachineCount = computed(() => {
  return overclockingConfigs.value.reduce((sum, config) => sum + config.count, 0)
})

// Get available recipes for selected generator
const availableRecipes = computed(() => {
  if (!selectedGeneratorType.value) return []
  return getRecipesForGenerator(selectedGeneratorType.value)
})

// Check if selected generator is fuel-based
const isFuelGenerator = computed(() => {
  if (!selectedGeneratorType.value) return false
  return isFuelBased(selectedGeneratorType.value)
})

// Check if selected generator is geothermal
const isGeothermalGenerator = computed(() => {
  if (!selectedGeneratorType.value) return false
  return isGeothermal(selectedGeneratorType.value)
})

// Check if selected generator has variable power
const hasVariablePowerOutput = computed(() => {
  if (!selectedGeneratorType.value) return false
  return hasVariablePower(selectedGeneratorType.value)
})

// Watch for generator type changes to reset recipe
watch(() => selectedGeneratorType.value, (newType) => {
  if (newType && isFuelBased(newType)) {
    const recipes = getRecipesForGenerator(newType)
    // Auto-select first recipe if none selected or if empty string
    if (recipes.length > 0 && (!selectedRecipeId.value || selectedRecipeId.value === '')) {
      selectedRecipeId.value = recipes[0]?.id || ''
    }
  } else {
    selectedRecipeId.value = ''
  }

  // Reset actualPower when switching generators
  if (newType && !hasVariablePower(newType)) {
    actualPower.value = undefined
  }
})

// Watch for modal open/close to reset or populate form
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.powerLine) {
      // Edit mode - populate with existing data
      selectedGeneratorType.value = props.powerLine.generatorType
      selectedRecipeId.value = props.powerLine.recipeId || ''
      connectedToGrid.value = props.powerLine.connectedToGrid
      actualPower.value = props.powerLine.actualPower
      overclockingConfigs.value = props.powerLine.overclocking.map(config => ({ ...config }))
    } else {
      // Add mode - reset form
      resetForm()
    }
  }
})

const resetForm = () => {
  selectedGeneratorType.value = ''
  selectedRecipeId.value = ''
  connectedToGrid.value = true
  actualPower.value = undefined
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
  if (!selectedGeneratorType.value || overclockingConfigs.value.length === 0) {
    return
  }

  // Validate fuel-based generators have a recipe selected
  if (isFuelGenerator.value && !selectedRecipeId.value) {
    return
  }

  // Filter out configs with 0 machines
  const validConfigs = overclockingConfigs.value.filter(config => config.count > 0)

  if (validConfigs.length === 0) {
    return
  }

  const machineCount = totalMachineCount.value

  emit('save', {
    generatorType: selectedGeneratorType.value,
    recipeId: selectedRecipeId.value || undefined,
    machineCount,
    overclocking: validConfigs,
    connectedToGrid: connectedToGrid.value,
    actualPower: actualPower.value
  })

  emit('close')
}

// Preset clock speeds
const presetClockSpeeds = [50, 100, 150, 200, 250]
</script>

<template>
  <Dialog :open="isOpen" @update:open="(open) => !open && emit('close')">
    <DialogContent class="sm:max-w-2xl max-h-[90vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>
          {{ powerLine ? 'Edit Power Generator' : 'Add Power Generator' }}
        </DialogTitle>
        <DialogDescription>
          Configure power generation from fuel-based or geothermal generators.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6 overflow-y-auto flex-1 pr-2">
        <!-- Generator Type Selector -->
        <div class="space-y-2">
          <Label for="generator-type">
            Generator Type <span class="text-destructive">*</span>
          </Label>
          <Select v-model="selectedGeneratorType">
            <SelectTrigger id="generator-type">
              <SelectValue placeholder="Select generator type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="generator in allPowerGenerators"
                  :key="generator.key_name"
                  :value="generator.key_name"
                >
                  {{ generator.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <!-- Recipe Selector (for fuel-based generators) -->
        <div v-if="isFuelGenerator && availableRecipes.length > 0" class="space-y-2">
          <Label for="recipe">
            Fuel Type <span class="text-destructive">*</span>
          </Label>
          <Select v-model="selectedRecipeId">
            <SelectTrigger id="recipe">
              <SelectValue placeholder="Select fuel type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="recipe in availableRecipes"
                  :key="recipe.id"
                  :value="recipe.id"
                >
                  {{ recipe.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <!-- Actual Power Input (for geothermal with variable power) -->
        <div v-if="isGeothermalGenerator && hasVariablePowerOutput" class="space-y-2">
          <Label for="actual-power">
            Actual Power Output (MW per generator)
          </Label>
          <Input
            id="actual-power"
            v-model.number="actualPower"
            type="number"
            min="0"
            step="1"
            placeholder="Enter actual MW (optional)"
          />
          <p class="text-xs text-muted-foreground">
            Leave empty to use base power ({{ allPowerGenerators.find(g => g.key_name === selectedGeneratorType)?.base_power }} MW)
          </p>
        </div>

        <!-- Grid Connection Checkbox -->
        <div class="flex items-center space-x-2">
          <Checkbox
            id="connected-to-grid"
            :model-value="connectedToGrid"
            @update:model-value="(value: boolean | 'indeterminate') => {
              if (typeof value === 'boolean') {
                connectedToGrid = value
              }
            }"
          />
          <Label for="connected-to-grid" class="text-sm font-normal cursor-pointer">
            Connected to global power grid
          </Label>
        </div>
        <p class="text-xs text-muted-foreground -mt-4 ml-6">
          Enable this if the generator is connected to your main power grid. In the future, you'll be able to create separate power grid groups.
        </p>

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
              type="button"
            >
              Add Config
            </Button>
          </div>

          <div class="space-y-3">
            <div
              v-for="(config, index) in overclockingConfigs"
              :key="index"
              class="space-y-3 p-3 border rounded-lg"
            >
              <div class="flex items-center gap-3">
                <div class="flex-1 grid grid-cols-2 gap-3">
                  <div class="space-y-2">
                    <Label :for="`count-${index}`" class="text-xs">Machine Count</Label>
                    <Input
                      :id="`count-${index}`"
                      v-model.number="config.count"
                      type="number"
                      min="1"
                      placeholder="Count"
                    />
                  </div>
                  <div class="space-y-2">
                    <Label :for="`percentage-${index}`" class="text-xs">Clock Speed (%)</Label>
                    <div class="flex gap-2">
                      <Input
                        :id="`percentage-${index}`"
                        v-model.number="config.percentage"
                        type="number"
                        min="1"
                        max="250"
                        step="1"
                        placeholder="100"
                        class="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  @click="removeOverclockingConfig(index)"
                  variant="ghost"
                  size="icon"
                  type="button"
                  :disabled="overclockingConfigs.length === 1"
                  class="mt-5"
                >
                  ×
                </Button>
              </div>

              <!-- Per-Config Calculations -->
              <div v-if="selectedGeneratorType" class="pt-2 border-t border-border/50 text-xs">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <div class="text-muted-foreground mb-1">Power Generation</div>
                    <div class="flex items-center gap-1.5">
                      <span class="text-chart-3 font-medium">
                        {{ (
                          (hasVariablePowerOutput && actualPower
                            ? actualPower
                            : allPowerGenerators.find(g => g.key_name === selectedGeneratorType)?.base_power || 0)
                          * config.count
                          * (config.percentage / 100)
                        ).toFixed(2) }} MW
                      </span>
                    </div>
                  </div>
                  <div v-if="(allPowerGenerators.find(g => g.key_name === selectedGeneratorType)?.power_consumption || 0) > 0">
                    <div class="text-muted-foreground mb-1">Power Consumption</div>
                    <div class="flex items-center gap-1.5">
                      <span class="text-chart-4 font-medium">
                        {{ (
                          (allPowerGenerators.find(g => g.key_name === selectedGeneratorType)?.power_consumption || 0)
                          * config.count
                          * Math.pow(config.percentage / 100, 1.6)
                        ).toFixed(2) }} MW
                      </span>
                    </div>
                  </div>
                </div>
                <!-- Fuel consumption for fuel-based generators -->
                <div v-if="isFuelGenerator && selectedRecipeId" class="mt-2">
                  <div class="text-muted-foreground mb-1">Fuel Consumption</div>
                  <div class="space-y-0.5">
                    <div v-for="input in availableRecipes.find(r => r.id === selectedRecipeId)?.inputs || []" :key="input.resource" class="flex items-center gap-1.5">
                      <span>{{ input.resource }}:</span>
                      <span class="text-destructive font-medium">
                        {{ (input.amount * config.count * (config.percentage / 100)).toFixed(2) }}/min
                      </span>
                    </div>
                  </div>
                </div>
                <!-- Waste production for fuel-based generators -->
                <div v-if="isFuelGenerator && selectedRecipeId && (availableRecipes.find(r => r.id === selectedRecipeId)?.outputs.length || 0) > 0" class="mt-2">
                  <div class="text-muted-foreground mb-1">Waste Production</div>
                  <div class="space-y-0.5">
                    <div v-for="output in availableRecipes.find(r => r.id === selectedRecipeId)?.outputs || []" :key="output.resource" class="flex items-center gap-1.5">
                      <span>{{ output.resource }}:</span>
                      <span class="text-chart-3 font-medium">
                        {{ (output.amount * config.count * (config.percentage / 100)).toFixed(2) }}/min
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Preset clock speeds -->
          <div class="flex flex-wrap gap-2">
            <span class="text-xs text-muted-foreground">Quick presets:</span>
            <Button
              v-for="speed in presetClockSpeeds"
              :key="speed"
              @click="() => {
                const lastConfig = overclockingConfigs[overclockingConfigs.length - 1];
                if (lastConfig) lastConfig.percentage = speed;
              }"
              variant="outline"
              size="sm"
              type="button"
              class="h-6 px-2 text-xs"
            >
              {{ speed }}%
            </Button>
          </div>

          <p class="text-xs text-muted-foreground">
            Total machines: <span class="font-medium text-foreground">{{ totalMachineCount }}</span>
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button @click="emit('close')" variant="outline" type="button">
          Cancel
        </Button>
        <Button @click="handleSave" type="button">
          {{ powerLine ? 'Update' : 'Add' }} Generator
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
