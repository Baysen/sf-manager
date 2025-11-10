import type { Location, ResourceExtractionLine, ResourceExtractionLineV1 } from '../types/location';

export const CURRENT_VERSION = '2.0.0';

// Location structure before v2.0.0
interface LocationV1 {
  id: string;
  name: string;
  pinned?: boolean;
  resourceExtractionLines: ResourceExtractionLineV1[];
  productionLines: any[];
  powerGenerationLines?: any[];
  exports?: any[];
}

/**
 * Migrate from v1.0.0 to v2.0.0
 * Changes:
 * - Moved minerType and purity from ResourceExtractionLine into OverclockingConfig
 * - This allows grouping multiple miner types and purities under one resource entry
 */
function migrateV1ToV2(locations: LocationV1[]): Location[] {
  return locations.map(location => {
    // Group resource extraction lines by resourceType
    const groupedExtractions = new Map<string, ResourceExtractionLineV1[]>();

    for (const line of location.resourceExtractionLines) {
      const existing = groupedExtractions.get(line.resourceType) || [];
      existing.push(line);
      groupedExtractions.set(line.resourceType, existing);
    }

    // Convert grouped extractions to new format
    const resourceExtractionLines: ResourceExtractionLine[] = [];

    for (const [resourceType, lines] of groupedExtractions) {
      if (lines.length === 0) continue;

      // Combine all lines for this resource into one entry
      const combinedLine: ResourceExtractionLine = {
        id: lines[0]!.id, // Keep the first ID
        resourceType,
        machineCount: 0,
        overclocking: []
      };

      // Convert each old line's overclocking configs to new format
      for (const line of lines) {
        for (const overclock of line.overclocking) {
          combinedLine.overclocking.push({
            count: overclock.count,
            percentage: overclock.percentage,
            somersloops: overclock.somersloops,
            minerType: line.minerType,
            purity: line.purity
          });
          combinedLine.machineCount += overclock.count;
        }
      }

      resourceExtractionLines.push(combinedLine);
    }

    return {
      ...location,
      resourceExtractionLines,
      powerGenerationLines: location.powerGenerationLines || [],
      exports: location.exports || []
    };
  });
}

/**
 * Apply all necessary migrations to bring data to the current version
 */
export function migrateData(data: any): Location[] {
  let version = data.version || '1.0.0';
  let locations = data.locations || data;

  // Apply migrations sequentially
  if (version === '1.0.0') {
    console.log('Migrating data from v1.0.0 to v2.0.0...');
    locations = migrateV1ToV2(locations);
    version = '2.0.0';
  }

  // Future migrations would go here
  // if (version === '2.0.0') {
  //   locations = migrateV2ToV3(locations);
  //   version = '3.0.0';
  // }

  return locations;
}

/**
 * Validate that imported data has the minimum required structure
 */
export function validateImportData(data: any): data is { version: string; locations: any[] } {
  if (!data || typeof data !== 'object') return false;

  // Version is optional (defaults to 1.0.0)
  if (data.version && typeof data.version !== 'string') return false;

  if (!Array.isArray(data.locations)) return false;

  // Validate each location has required fields
  return data.locations.every((loc: any) =>
    loc &&
    typeof loc === 'object' &&
    typeof loc.id === 'string' &&
    typeof loc.name === 'string' &&
    Array.isArray(loc.productionLines)
  );
}
