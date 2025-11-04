<script setup lang="ts">
import { computed } from 'vue';
import { getIconPath, getDisplayName } from '../../utils/iconMapper';

interface Props {
  resourceKey: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTooltip?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showTooltip: true
});

const iconPath = computed(() => getIconPath(props.resourceKey));
const displayName = computed(() => getDisplayName(props.resourceKey));

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };
  return sizes[props.size];
});

// Fallback icon component for resources without icons
const showFallback = computed(() => !iconPath.value);
</script>

<template>
  <div
    class="inline-flex items-center justify-center flex-shrink-0"
    :class="sizeClasses"
    :title="showTooltip ? displayName : undefined"
  >
    <img
      v-if="!showFallback"
      :src="iconPath!"
      :alt="displayName"
      :class="sizeClasses"
      class="object-contain"
      loading="lazy"
    />
    <div
      v-else
      :class="sizeClasses"
      class="bg-neutral-700 rounded flex items-center justify-center text-neutral-400 text-xs font-bold"
    >
      {{ displayName.substring(0, 2).toUpperCase() }}
    </div>
  </div>
</template>
