<script setup lang="ts">
import { computed } from 'vue';
import type { ResourceExtractionLine } from '../../types/location';
import { useMiners, type Resource } from '../../composables/useMiners';
import { useCalculations } from '../../composables/useCalculations';
import ResourceIcon from '../common/ResourceIcon.vue';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-vue-next';

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
      <div class="flex justify-between items-start mb-3">
        <div class="flex items-center gap-3">
          <ResourceIcon :resource-key="resource.key_name" size="md" />
          <div>
            <h4 class="text-base font-semibold mb-1">{{ resource.name }}</h4>
            <p class="text-xs text-muted-foreground">
              {{ getTotalMachines() }} total machines
            </p>
          </div>
        </div>
        <div class="flex gap-1">
          <Button
            @click="emit('edit', extractionLine.id)"
            variant="ghost"
            size="icon"
            class="h-8 w-8"
          >
            <Pencil class="h-4 w-4" />
          </Button>
          <Button
            @click="emit('delete', extractionLine.id)"
            variant="ghost"
            size="icon"
            class="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- Grouped extraction details -->
      <div class="text-xs mb-3 space-y-2">
        <div
          v-for="(group, index) in groupedConfigs"
          :key="index"
          class="flex items-center gap-2 flex-wrap"
        >
          <span class="text-muted-foreground">{{ group.minerName }}</span>
          <span class="text-muted-foreground">{{ group.display }}</span>
          <span class="text-muted-foreground">•</span>
          <div class="flex items-center gap-1">
            <span v-for="(config, configIndex) in group.configs" :key="configIndex">
              <span class="text-foreground">{{ config.count }}</span> @ <span class="text-chart-4">{{ config.percentage }}%</span>
              <span v-if="configIndex < group.configs.length - 1" class="text-muted-foreground mx-1">+</span>
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between text-xs pt-3 border-t">
        <div>
          <span class="text-muted-foreground">Production:</span>
          <span class="text-chart-3 ml-1 font-medium">{{ getExtractionRate().toFixed(1) }}/min</span>
        </div>
        <div class="text-right">
          <span class="text-muted-foreground">Power:</span>
          <span class="text-chart-4 ml-1 font-medium">{{ getTotalPower().toFixed(1) }} MW</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
