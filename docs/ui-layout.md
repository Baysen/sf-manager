# UI Layout Reference

## Navigation Structure
```
Sidebar Navigation (Left, collapsible)
├── App Header (Factory icon + title)
├── Main Navigation
│   ├── Locations
│   └── Available Recipes
├── Location List (when "Locations" is active)
│   ├── Pinned Section (if any)
│   │   └── Location Cards (Pin icon, name, ⋮ menu)
│   ├── Your Locations Section
│   │   └── Location Cards (MapPin icon, name, ⋮ menu)
│   └── [+ Add Location button]
└── Footer
    ├── Export Data
    └── Import Data

Main Content Area
└── Location Content (when location is selected)
    ├── Left Panel (70%)
    │   ├── Resource Extractions List
    │   ├── Production Lines List
    │   └── Resource Exports List
    └── Right Panel (30%)
        ├── Resource Summary Card
        └── Power Summary Card
```

## Resource Summary Display
For each resource:
- Resource name
- Production: +X/min (from local production/mining)
- Imports (detailed list, always visible):
  - From Location A: +Y/min
  - From Location B: +Z/min
- Consumption: -X/min (used by local recipes)
- Exports (detailed list, always visible):
  - To Location C: -W/min
  - To Location D: -V/min
- Net: ±X/min
- Status indicator (Surplus/Balanced/Deficit)

## Power Summary Display
- **Generation Breakdown** (green): Lists each generator type with total MW
- **Consumption Breakdown** (red): Lists each machine/extractor type with total MW consumed
- **Net Power** (with status indicator):
  - Surplus (green): Net > 0.1 MW
  - Balanced (yellow): -0.1 MW ≤ Net ≤ 0.1 MW
  - Deficit (red): Net < -0.1 MW
