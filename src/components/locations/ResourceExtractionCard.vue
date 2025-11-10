<script setup lang="ts">
import { computed } from 'vue';
import type { ResourceExtractionLine } from '../../types/location';
import { useMiners, type Resource } from '../../composables/useMiners';
import { useCalculations } from '../../composables/useCalculations';
import ResourceIcon from '../common/ResourceIcon.vue';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, Pencil, Trash2, Zap } from 'lucide-vue-next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const props = defineProps<{
  extractionLine: ResourceExtractionLine;
  resource: Resource;
}>();

const emit = defineEmits<{
  edit: [id: string];
  delete: [id: string];
}>();

const { getMinerByKeyName } = useMiners();
const { calculateExtractionRate, calculateExtractionPower } = useCalculations();

// Group extraction configs by miner type and purity (or satellites for resource wells)
const groupedConfigs = computed(() => {
  const groups: { [key: string]: { minerName: string; display: string; configs: typeof props.extractionLine.overclocking } } = {};

  for (const config of props.extractionLine.overclocking) {
    if (!config.minerType) continue;

    const miner = getMinerByKeyName(config.minerType);
    const minerName = miner?.name || config.minerType;

    // Resource Well Pressurizer: show satellite breakdown
    if (config.minerType === 'resource-well-pressurizer' && config.satellites) {
      const satelliteSummary = config.satellites.map(s => s.purity).sort().join('-');
      const key = `${config.minerType}-${satelliteSummary}`;

      if (!groups[key]) {
        const satelliteCount = config.satellites.length;
        const purityBreakdown = config.satellites.reduce((acc, sat) => {
          acc[sat.purity] = (acc[sat.purity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const display = Object.entries(purityBreakdown)
          .map(([purity, count]) => `${count}× ${purity}`)
          .join(', ');

        groups[key] = {
          minerName,
          display: `${satelliteCount} satellite${satelliteCount > 1 ? 's' : ''} (${display})`,
          configs: []
        };
      }
      groups[key].configs.push(config);
    }
    // Regular extractors: group by purity
    else if (config.purity) {
      const key = `${config.minerType}-${config.purity}`;
      if (!groups[key]) {
        groups[key] = {
          minerName,
          display: config.purity,
          configs: []
        };
      }
      groups[key].configs.push(config);
    }
  }

  return Object.values(groups);
});

const getTotalMachines = () => {
  return props.extractionLine.machineCount;
};

const getExtractionRate = () => {
  return calculateExtractionRate(props.extractionLine);
};

const getTotalPower = () => {
  return calculateExtractionPower(props.extractionLine);
};

</script>

<template>
  <Card class="hover:border-muted-foreground/50 transition-colors">
    <CardContent class="p-3">
      <div class="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 items-start">
        <!-- Column 1: Icon, Name, Grouped Configs -->
        <div class="flex items-start gap-3">
          <ResourceIcon :resource-key="resource.key_name" size="md" class="flex-shrink-0 mt-0.5" />
          <div class="min-w-0">
            <h4 class="text-sm font-semibold mb-2">{{ resource.name }}</h4>
            <!-- Grouped extraction details -->
            <div class="text-xs space-y-2">
              <div
                v-for="(group, index) in groupedConfigs"
                :key="index"
                class="flex flex-col gap-1"
              >
                <span class="text-muted-foreground">{{ group.minerName }} ({{ group.display }})</span>
                <div class="flex items-center gap-1 flex-wrap">
                  <span v-for="(config, configIndex) in group.configs" :key="configIndex">
                    <span class="text-foreground">{{ config.count }}</span> @ <span class="text-chart-4">{{ config.percentage }}%</span>
                    <span v-if="configIndex < group.configs.length - 1" class="text-muted-foreground mx-1">+</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Column 2: Empty (no inputs for extraction) -->
        <div class="text-xs">
          <div class="text-muted-foreground mb-1.5 font-medium">Inputs</div>
          <div class="text-muted-foreground text-xs">—</div>
          <div class="flex items-center gap-1.5 mt-2">
            <Zap class="h-4 w-4 text-chart-4" />
            <span class="text-chart-4 font-medium">{{ getTotalPower().toFixed(1) }} MW</span>
          </div>
        </div>

        <!-- Column 3: Output -->
        <div class="text-xs">
          <div class="text-muted-foreground mb-1.5 font-medium">Output</div>
          <div class="flex items-center gap-1.5">
            <ResourceIcon :resource-key="resource.key_name" size="sm" />
            <div class="flex flex-col">
              <span class="text-muted-foreground text-xs">{{ resource.name }}</span>
              <span class="text-chart-3 font-medium">{{ getExtractionRate().toFixed(1) }}/min</span>
            </div>
          </div>
        </div>

        <!-- Column 4: Actions -->
        <div class="flex items-start justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon" class="h-8 w-8">
                <MoreVertical class="h-4 w-4" />
                <span class="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end">
              <DropdownMenuItem @click="emit('edit', extractionLine.id)">
                <Pencil class="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                class="text-destructive focus:text-destructive"
                @click="emit('delete', extractionLine.id)"
              >
                <Trash2 class="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
