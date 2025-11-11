# Data Structures Reference

## Recipe
```json
{
  "id": "string (unique)",
  "name": "string",
  "machine": "string (Miner Mk1, Constructor, Assembler, Manufacturer, etc.)",
  "isAlternate": "boolean",
  "inputs": [
    {
      "resource": "string",
      "amount": "number (per minute)"
    }
  ],
  "outputs": [
    {
      "resource": "string",
      "amount": "number (per minute)"
    }
  ],
  "powerConsumption": "number (MW per machine at 100%)"
}
```

## Location
```json
{
  "id": "string (unique)",
  "name": "string",
  "pinned": "boolean (optional, whether location is pinned/favorited)",
  "productionLines": [
    {
      "id": "string (unique)",
      "recipeId": "string (reference to recipe)",
      "machineCount": "number",
      "overclocking": [
        {
          "count": "number (machines at this clock speed)",
          "percentage": "number (100, 150, 250, etc.)"
        }
      ]
    }
  ],
  "resourceExtractionLines": [
    {
      "id": "string (unique)",
      "minerType": "string (miner-mk1, miner-mk2, miner-mk3, oil-pump, water-extractor)",
      "resourceType": "string (iron-ore, copper-ore, crude-oil, water, etc.)",
      "purity": "string (impure | normal | pure)",
      "machineCount": "number",
      "overclocking": [
        {
          "count": "number (extractors at this clock speed)",
          "percentage": "number (100, 150, 250, etc.)"
        }
      ]
    }
  ],
  "exports": [
    {
      "id": "string (unique)",
      "resource": "string",
      "toLocationId": "string (destination location ID)",
      "mode": "percentage | absolute",
      "value": "number (percentage 0-100 or absolute amount per minute)"
    }
  ]
}
```

**Note on Imports**: Imports are NOT stored in the location data structure. They are automatically calculated from other locations' exports. Each location's import list is derived by finding all exports from other locations where `toLocationId` matches this location's ID.

## Power Generator
```typescript
{
  id: string;
  generatorType: string; // biomass-burner, coal-generator, etc.
  recipeId?: string; // Required for fuel-based, optional for geothermal
  machineCount: number;
  overclocking: OverclockingConfig[];
  connectedToGrid: boolean; // Whether connected to global power grid
  actualPower?: number; // For geothermal with variable power (MW per generator)
}
```

## App Data Export Format
```json
{
  "version": "string (1.0.0)",
  "exportDate": "string (ISO date)",
  "locations": [
    "Location objects array"
  ]
}
```
