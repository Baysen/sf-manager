import { ref } from 'vue';
import type { SourceData } from '../types/sourceData';
import rawSourceData from '../data/source-data.json';

const data = rawSourceData as unknown as SourceData;

export interface Miner {
  name: string;
  key_name: string;
  category: 'mineral' | 'oil' | 'water';
  base_rate: number; // items per minute at 100%
  power: number; // MW at 100%
}

export interface Resource {
  key_name: string;
  name: string;
  category: 'mineral' | 'oil' | 'water';
}

// Purity multipliers for resource nodes
export const PURITY_MULTIPLIERS = {
  impure: 0.5,
  normal: 1.0,
  pure: 2.0
} as const;

const allMiners = ref<Miner[]>(data.miners);

// Create a map of resource key names to display names
const resourceMap = new Map<string, string>();
data.items.forEach(item => {
  resourceMap.set(item.key_name, item.name);
});
data.fluids.forEach(fluid => {
  resourceMap.set(fluid.key_name, fluid.name);
});

// Get resources that can be extracted
const extractableResources = ref<Resource[]>(
  data.resources.map(resource => ({
    key_name: resource.key_name,
    name: resourceMap.get(resource.key_name) || resource.key_name,
    category: resource.category as 'mineral' | 'oil' | 'water'
  }))
);

export function useMiners() {
  const getMinerByKeyName = (keyName: string): Miner | undefined => {
    return allMiners.value.find(miner => miner.key_name === keyName);
  };

  const getResourceByKeyName = (keyName: string): Resource | undefined => {
    return extractableResources.value.find(resource => resource.key_name === keyName);
  };

  const getMinersForCategory = (category: 'mineral' | 'oil' | 'water'): Miner[] => {
    return allMiners.value.filter(miner => miner.category === category);
  };

  const getResourcesForCategory = (category: 'mineral' | 'oil' | 'water'): Resource[] => {
    return extractableResources.value.filter(resource => resource.category === category);
  };

  return {
    allMiners,
    extractableResources,
    getMinerByKeyName,
    getResourceByKeyName,
    getMinersForCategory,
    getResourcesForCategory
  };
}
