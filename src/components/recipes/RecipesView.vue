<script setup lang="ts">
import { useRecipes } from '../../composables/useRecipes';
import ResourceIcon from '../common/ResourceIcon.vue';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const {
  filteredRecipes,
  searchQuery,
  machineFilter,
  alternateFilter,
  machineTypes
} = useRecipes();
</script>

<template>
  <div class="p-6">
    <div class="mb-6 space-y-4">
      <!-- Search Bar -->
      <div>
        <Input
          v-model="searchQuery"
          type="text"
          placeholder="Search recipes, resources..."
          class="w-full max-w-md"
        />
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4">
        <!-- Machine Type Filter -->
        <div>
          <Label class="block text-sm mb-1">Machine Type</Label>
          <Select v-model="machineFilter">
            <SelectTrigger class="w-48">
              <SelectValue placeholder="All Machines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Machines</SelectItem>
              <SelectItem v-for="machine in machineTypes" :key="machine" :value="machine">
                {{ machine }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Alternate Filter -->
        <div>
          <Label class="block text-sm mb-1">Recipe Type</Label>
          <Select v-model="alternateFilter">
            <SelectTrigger class="w-48">
              <SelectValue placeholder="All Recipes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Recipes</SelectItem>
              <SelectItem value="standard">Standard Only</SelectItem>
              <SelectItem value="alternate">Alternate Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Results Count -->
        <div class="flex items-end">
          <span class="text-sm text-muted-foreground">
            {{ filteredRecipes.length }} recipe{{ filteredRecipes.length !== 1 ? 's' : '' }}
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        class="hover:border-muted-foreground/50 transition-colors"
      >
        <CardContent class="p-3">
          <div class="flex items-start justify-between mb-3">
            <h3 class="text-base font-semibold">{{ recipe.name }}</h3>
            <Badge
              v-if="recipe.isAlternate"
              variant="secondary"
              class="text-xs"
            >
              ALT
            </Badge>
          </div>

          <p class="text-sm text-muted-foreground mb-3">{{ recipe.machine }}</p>

          <div class="space-y-3">
            <div>
              <div class="text-xs text-muted-foreground mb-1.5 font-medium">Inputs</div>
              <div class="space-y-1">
                <div v-for="input in recipe.inputs" :key="input.resource" class="text-xs flex items-center gap-1.5">
                  <ResourceIcon :resource-key="input.resource" size="sm" />
                  <span class="text-muted-foreground">{{ input.resource }}:</span>
                  <span class="text-destructive font-medium ml-auto">{{ input.amount }}</span>
                </div>
              </div>
            </div>

            <div>
              <div class="text-xs text-muted-foreground mb-1.5 font-medium">Outputs</div>
              <div class="space-y-1">
                <div v-for="output in recipe.outputs" :key="output.resource" class="text-xs flex items-center gap-1.5">
                  <ResourceIcon :resource-key="output.resource" size="sm" />
                  <span class="text-muted-foreground">{{ output.resource }}:</span>
                  <span class="text-chart-3 font-medium ml-auto">{{ output.amount }}</span>
                </div>
              </div>
            </div>

            <div class="pt-3 border-t">
              <div class="flex justify-between items-center text-xs">
                <span class="text-muted-foreground">Power:</span>
                <span class="text-chart-4 font-medium">{{ recipe.powerConsumption }} MW</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
