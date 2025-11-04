/**
 * Maps resource key names to their icon file names
 * The satisfactory-calculator uses the display name for icon files (e.g., "Iron Ore.png")
 * We need to map from key_name to the actual icon filename
 */

import type { SourceData } from '../types/sourceData';
import rawSourceData from '../data/source-data.json';

const data = rawSourceData as unknown as SourceData;

// Build the mapping from key_name to display name
const keyToNameMap = new Map<string, string>();

// Add items
data.items.forEach(item => {
  keyToNameMap.set(item.key_name, item.name);
});

// Add fluids
data.fluids.forEach(fluid => {
  keyToNameMap.set(fluid.key_name, fluid.name);
});

// Note: resources only have key_name, not name
// The resource names are already mapped from items/fluids above

// Add buildings (for machine icons)
data.buildings.forEach(building => {
  keyToNameMap.set(building.key_name, building.name);
});

// Add miners
data.miners.forEach(miner => {
  keyToNameMap.set(miner.key_name, miner.name);
});

/**
 * Get the icon path for a resource
 * @param resourceName - Can be either a key_name (e.g., "iron-ore") or display name (e.g., "Iron Ore")
 * @returns The path to the icon file or null if not found
 */
export function getIconPath(resourceName: string): string | null {
  // First check if it's a key_name
  let displayName = keyToNameMap.get(resourceName);

  // If not found, assume it's already a display name
  if (!displayName) {
    displayName = resourceName;
  }

  // Convert display name to filename (e.g., "Iron Ore" -> "Iron Ore.png")
  return `/icons/${displayName}.png`;
}

/**
 * Get the display name for a resource
 * @param resourceName - Can be either a key_name (e.g., "iron-ore") or display name (e.g., "Iron Ore")
 * @returns The display name
 */
export function getDisplayName(resourceName: string): string {
  // First check if it's a key_name
  const displayName = keyToNameMap.get(resourceName);

  // If not found, assume it's already a display name
  return displayName || resourceName;
}
