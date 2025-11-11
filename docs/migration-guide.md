# Data Migration Guide

## Critical Rules
1. **MUST** maintain the current version format (currently `2.0.0`)
2. **MUST NOT** remove or rename existing fields without providing migration logic
3. **MUST** increment version number when making breaking changes to the data structure
4. **MUST** implement migration functions in `useMigrations.ts` to handle older format versions
5. **MUST** test migration paths thoroughly before deploying changes

## Migration Strategy
When a breaking change to the data structure is required:

1. **Increment the version number** in `useMigrations.ts` (e.g., `1.0.0` → `2.0.0`)
2. **Add migration logic** in `useMigrations.ts`:
   ```typescript
   // Example migration from v1.0.0 to v2.0.0
   if (version === '1.0.0') {
     console.log('Migrating data from v1.0.0 to v2.0.0...');
     locations = migrateV1ToV2(locations);
     version = '2.0.0';
   }
   ```
3. **Document the migration** in comments explaining what changed and why
4. **Test with real exports** from previous versions to ensure no data loss
5. **Keep migration code indefinitely** - never remove old migration logic

## Migration System Architecture
- **Dedicated file**: `src/composables/useMigrations.ts` contains all migration logic
- **Version tracking**: Both localStorage and export files include version markers
- **Automatic migration**: `loadLocations()` and `importData()` automatically detect and migrate old versions
- **Sequential migrations**: Migrations are applied in order (v1→v2→v3), allowing skipping versions
- **One-time execution**: localStorage migrations save immediately after running, preventing re-migration

## Current Migrations

### v1.0.0 → v2.0.0 (Resource Extraction Refactor)
**Changes:**
- Moved `minerType` and `purity` from `ResourceExtractionLine` into `OverclockingConfig`
- Groups multiple extraction lines for the same resource into one entry
- Allows mixing different miner types and purities under one resource

**Migration Logic:**
- Groups old extraction lines by `resourceType`
- Combines all lines for same resource into single entry
- Moves `minerType` and `purity` into each overclocking config
- Preserves all machine counts and clock speeds

**Files Changed:**
- `src/types/location.ts`: Updated `ResourceExtractionLine` and `OverclockingConfig`
- `src/composables/useCalculations.ts`: Updated to handle nested miner types
- `src/components/locations/ResourceExtractionModal.vue`: New UI for multiple configs
- `src/components/locations/ResourceExtractionCard.vue`: Groups display by miner+purity

## When Adding New Fields
- **Optional fields**: Can be added without version bump, but must have safe defaults in migration logic
- **Required fields**: MUST bump version and provide migration to populate the field for old data

**Never assume all users will re-export their data. Always support importing older format versions.**
