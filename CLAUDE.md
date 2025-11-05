# Satisfactory Factory Manager

## Project Overview
A web application to track and manage multiple factory locations in Satisfactory, including production lines, resource flow, and balance calculations.

## Tech Stack
- **Frontend Framework**: Vue.js 3.5.13 (Composition API with `<script setup>`)
- **Build Tool**: Vite
- **UI Library**: Preline UI v3.2.1
- **CSS Framework**: Tailwind CSS v4.0 (via @tailwindcss/vite plugin)
- **Additional Plugin**: @tailwindcss/forms (required by Preline UI)
- **Data Persistence**: LocalStorage with JSON export/import functionality
- **Language**: TypeScript

### ⚠️ CRITICAL: Version Consistency Requirements

**IT IS PARAMOUNT** that all code follows the EXACT patterns for the versions specified above. Do NOT mix Tailwind CSS v3 and v4 syntax, or use deprecated patterns from older versions.

#### Tailwind CSS v4 Specific Requirements:
1. **MUST** use `@tailwindcss/vite` plugin in `vite.config.ts` (NOT PostCSS)
2. **MUST** use `@import "tailwindcss";` in CSS files (NOT `@tailwind` directives)
3. **MUST** use `@plugin` directive for plugins in CSS (e.g., `@plugin '@tailwindcss/forms';`)
4. **DO NOT** use `tailwind.config.js` - v4 uses CSS-based configuration
5. **DO NOT** use `@tailwindcss/postcss` - only use for non-Vite projects

#### Vue 3 Specific Requirements:
1. **MUST** use Composition API with `<script setup>` syntax
2. **MUST** use TypeScript for all component logic
3. **DO NOT** use Options API unless absolutely necessary

#### Preline UI Requirements:
1. **MUST** import `preline/variants.css` in CSS: `@import 'preline/variants.css';`
2. **MUST** use `@source` directive to include Preline JS: `@source '../../node_modules/preline/dist/*.js';`
3. **MUST** import `'preline/preline'` in main.ts for TypeScript support
4. **MUST** initialize with `window.HSStaticMethods.autoInit()` after route changes
5. **MUST** reference official Preline UI documentation for component markup

**When in doubt, ALWAYS check the official documentation for the current version before writing code.**

## Core Features

### MVP (Phase 1)
1. Recipe management system with all Satisfactory recipes ✅
2. Multi-location factory tracking ✅
3. Production line management per location ✅
4. Resource balance calculations per location ✅
5. Overclocking support ✅
6. Power consumption tracking ✅
7. Local storage persistence ✅
8. JSON export/import functionality ✅
9. Icons for all resources ✅

### Post-MVP (Phase 2)
- Resource flow tracking between locations ✅
- Alphabetical sorting of all lists AND/OR ability to drag and drop sort
- Better visualization of alternate recipes in dropdowns
- Add power creation machines
- Limit resource extraction machines to the resources they can actually extract
- Overview page summarizing all locations
- Accordion-like functionality to be able to collapse sections (Resource Extraction, ...)
- A way to sort and edit/delete locations


### Post-MVP (Phase 3)
- Suggest simple optimizations that could make use of small surpluses (like having 15 iron ore surplus, suggest overclocking one machine to 150%). This is only for small corrections
- If a resource of a production line is in deficit, suggest improvements depending on:
  - Is the resource extracted on the same location? -> Suggest more miners or overclocking if available
  - Is the resource imported? -> Suggest improvements on the location where it comes from, making it clear the addition would be to satisfy an exported resource
- Suggestions for optimizations
  - If all required resources of a production line are in surplus big enough to warrant extra machines, calculate the possible maximum it could handle and visually suggest adding them with "ghost entries"
- Somersloop production multiplier support
- Recipe categorization by tier
- Compact mode where everything is packed even tighter
- "Path to resource goal" - Set how much more of a resource you want to produce and get the exact list of machines etc you need to add to make it happen
  - Possible to do even across locations?
- Somehow make it possible to share factories through a URL?

### Post-MVP (Stretch Goals)
- Importing and parsing saves to import locations from train stations / truck stations / drone pads
  - Possibly even finding and importing all connected machines

### Planned Improvements


## Data Structure

### Recipe
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

### Location
```json
{
  "id": "string (unique)",
  "name": "string",
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
  "resourceExtractions": [
    {
      "id": "string (unique)",
      "resource": "string",
      "extractorType": "string (Miner Mk1, Miner Mk2, Miner Mk3, Oil Extractor, Water Extractor)",
      "purityCounts": {
        "impure": "number",
        "normal": "number",
        "pure": "number"
      },
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

### App Data Export Format
```json
{
  "version": "string (1.0.0)",
  "exportDate": "string (ISO date)",
  "locations": [
    "Location objects array"
  ]
}
```

## UI Layout

### Navigation Structure
```
Main Navigation (Top)
├── Locations
└── Available Recipes

Location View (when "Locations" is active)
├── Location Tabs (horizontal tabs for each location)
│   └── [+ Add Location button]
│
└── Location Content (for selected tab)
    ├── Left Panel (70%)
    │   ├── Resource Extractions List
    │   │   ├── [+ Add Resource Extraction button]
    │   │   └── Resource Extraction Cards (grouped by resource)
    │   │       ├── Resource name
    │   │       ├── Extractor type
    │   │       ├── Purity breakdown
    │   │       ├── Overclocking details
    │   │       ├── Total extraction rate
    │   │       └── [Edit] [Delete] actions
    │   │
    │   ├── Production Lines List
    │   │   ├── [+ Add Production Line button]
    │   │   └── Production Line Cards (grouped by recipe)
    │   │       ├── Recipe name
    │   │       ├── Machine type
    │   │       ├── Machine count
    │   │       ├── Overclocking details
    │   │       ├── Total production/consumption rates
    │   │       └── [Edit] [Delete] actions
    │   │
    │   ├── Resource Exports List
    │   │   ├── [+ Add Resource Export button]
    │   │   └── Resource Export Cards (grouped by resource)
    │   │       ├── Resource name
    │   │       ├── Destination location
    │   │       ├── Export amount (calculated)
    │   │       ├── Mode (percentage/absolute) and value
    │   │       ├── Validation warnings (if any)
    │   │       └── [Edit] [Delete] actions
    │   │
    │   ├── Add/Edit Resource Extraction Modal
    │   │   ├── Resource selector (dropdown)
    │   │   ├── Extractor type selector
    │   │   ├── Purity counts (impure/normal/pure)
    │   │   ├── Overclocking configuration
    │   │   │   └── Dynamic list: [X extractors at Y%]
    │   │   └── [Save] [Cancel]
    │   │
    │   ├── Add/Edit Production Line Modal
    │   │   ├── Recipe selector (searchable dropdown)
    │   │   ├── Machine count input
    │   │   ├── Overclocking configuration
    │   │   │   └── Dynamic list: [X machines at Y%]
    │   │   └── [Save] [Cancel]
    │   │
    │   └── Add/Edit Resource Export Modal
    │       ├── Resource selector (dropdown, filtered to surplus resources)
    │       ├── Destination location selector
    │       ├── Export mode selector (Percentage/Absolute)
    │       ├── Value input (percentage or absolute amount)
    │       ├── Preview: "Will export X/min"
    │       ├── Validation messages
    │       └── [Save] [Cancel]
    │
    └── Right Panel (30%)
        ├── Resource Summary Card
        │   └── For each resource involved:
        │       ├── Resource name
        │       ├── Production: +X/min (from local production/mining)
        │       ├── Imports (detailed list, always visible):
        │       │   ├── From Location A: +Y/min
        │       │   └── From Location B: +Z/min
        │       ├── Consumption: -X/min (used by local recipes)
        │       ├── Exports (detailed list, always visible):
        │       │   ├── To Location C: -W/min
        │       │   └── To Location D: -V/min
        │       ├── Net: ±X/min
        │       └── Status indicator (text + color)
        │           ├── "Surplus" (green) - net is positive
        │           ├── "Balanced" (yellow) - net is ~0
        │           └── "Deficit" (red) - net is negative
        │
        └── Power Summary Card
            ├── Total Power Consumption
            └── Breakdown by machine type

Available Recipes View
├── Search/Filter bar
│   ├── Search by name
│   ├── Filter by machine type
│   └── Filter by alternate/standard
│
└── Recipe Cards Grid
    └── Recipe Card
        ├── Recipe name
        ├── Machine type
        ├── Alternate badge (if applicable)
        ├── Inputs list (with amounts)
        ├── Outputs list (with amounts)
        └── Power consumption
```

## Business Logic

### Production Rate Calculation
For each production line:
```
For each overclocking configuration:
  machinesAtSpeed = count
  speedMultiplier = percentage / 100
  production = baseRecipeOutput * machinesAtSpeed * speedMultiplier

Total production = sum of all overclocking configurations
```

### Power Consumption Calculation
```
For each overclocking configuration:
  machinesAtSpeed = count
  speedMultiplier = percentage / 100
  powerMultiplier = speedMultiplier ^ 1.6
  power = basePowerConsumption * machinesAtSpeed * powerMultiplier

Total power = sum of all overclocking configurations
```

### Resource Balance Calculation
For each resource at a location:
```
Production = sum of all outputs of that resource from all production lines + resource extractions
Imports = sum of all exports from other locations where toLocationId matches this location
Consumption = sum of all inputs of that resource from all production lines
Exports = sum of all exports from this location for that resource
Net = Production + Imports - Consumption - Exports

Status:
  if Net > 0.1: "Surplus" (green)
  if Net < -0.1: "Deficit" (red)
  if -0.1 <= Net <= 0.1: "Balanced" (yellow)
```

### Export Calculation and Validation
When calculating export amounts:
```
For each export:
  if mode == "percentage":
    availableSurplus = Production + Imports - Consumption
    exportAmount = (availableSurplus * value) / 100
  else if mode == "absolute":
    exportAmount = value

Validation:
  totalExports = sum of all export amounts for a resource
  availableSurplus = Production + Imports - Consumption

  if mode == "percentage":
    totalPercentage = sum of all percentage values for a resource
    if totalPercentage > 100:
      INVALID: "Total export percentage exceeds 100%"

  if mode == "absolute":
    if totalExports > availableSurplus:
      WARNING: "Exporting more than available surplus"
```

## Data Persistence

### LocalStorage
- Store all locations data under key: `satisfactory-manager-locations`
- Store app settings under key: `satisfactory-manager-settings`
- Auto-save on every change

### Export/Import
- Export button creates downloadable JSON file with timestamp in filename
- Import button accepts JSON file and validates structure before loading
- Show confirmation before importing (will overwrite existing data)

## Recipe Data Source
- Include recipes.json file in the project with all Satisfactory recipes
- Load recipes from JSON file on app initialization
- Recipes are read-only in the app (not editable by user)

## Resource Flow Between Locations (Phase 2)

### Export-Driven Model
The system uses an **export-driven model** where:
- Each location explicitly defines what resources it **exports** to other locations
- **Imports are automatically calculated** by finding all exports from other locations targeting this location
- This matches the natural workflow: "I have surplus Iron Ore here, send 60% to Base and 40% to Steel Factory"

### Export Modes
Each export can be configured in two ways:

1. **Percentage Mode** (Recommended)
   - Specify what percentage of the surplus to export
   - Example: "Export 60% of Iron Ore surplus to Main Base"
   - Automatically adjusts if production changes
   - Validation: Total percentages for a resource cannot exceed 100%

2. **Absolute Mode**
   - Specify exact amount per minute to export
   - Example: "Export 120/min Iron Ore to Main Base"
   - Fixed amount regardless of production changes
   - Validation: Shows warning if total exports exceed available surplus

### Export Calculation
```
availableSurplus = (Production + Imports) - Consumption

For percentage mode:
  exportAmount = (availableSurplus * percentage) / 100

For absolute mode:
  exportAmount = specifiedAmount
```

### Validation Rules
1. **Percentage Mode**: Sum of all percentage exports for a resource must not exceed 100%
2. **Absolute Mode**: Sum of all absolute exports should not exceed available surplus (shows warning, not blocking)
3. **Resource Selector**: Only resources with positive surplus should be available for export
4. **Destination Selector**: Cannot export to the same location

### Import Display (Read-Only)
On each location, imports are displayed in the Resource Summary but cannot be directly edited:
- Shows detailed breakdown of each import source
- Format: "From [Location Name]: +[amount]/min"
- All import sources are always visible (not collapsed/expandable)
- To modify an import, user must navigate to the source location and edit its export configuration

## Future Considerations (Post-MVP)

### Overview Page (Phase 2)
- Summary of all locations
- Global resource balance across all locations
- Visual indication of resource flow/dependencies between locations
- Identify bottlenecks and optimization opportunities

### Somersloop Support
- Add somersloop count to production line configuration
- **IMPORTANT**: Somersloop multipliers vary by machine type (e.g., some machines need 4 somersloops to reach 2x production)
- Store somersloop-to-multiplier mapping per machine type in recipe data

### Recipe Categorization
- Tier badges (1-8)
- Category tags (Mining, Smelting, Construction, Advanced Manufacturing, etc.)
- Filter recipes by tier and category

## Development Notes
- Use Vue 3 Composition API with `<script setup>` syntax
- Use TypeScript for type safety
- Component structure should be modular and reusable
- Responsive design (mobile-friendly)
- **Design System**: Use Preline UI's **dark mode** as the default theme
- **Component Usage**: Stick to Preline's ready-made components as much as possible
- Always reference Preline UI documentation for component implementation
- Tailwind CSS v4.0 for utility styling

## File Structure Suggestion
```
src/
├── components/
│   ├── locations/
│   │   ├── LocationTabs.vue
│   │   ├── ProductionLineCard.vue
│   │   ├── ProductionLineModal.vue
│   │   ├── ResourceSummary.vue
│   │   └── PowerSummary.vue
│   ├── recipes/
│   │   ├── RecipeGrid.vue
│   │   ├── RecipeCard.vue
│   │   └── RecipeFilter.vue
│   └── common/
│       ├── AppNavigation.vue
│       └── ExportImport.vue
├── composables/
│   ├── useLocations.ts
│   ├── useRecipes.ts
│   ├── useStorage.ts
│   └── useCalculations.ts
├── types/
│   ├── recipe.ts
│   ├── location.ts
│   └── productionLine.ts
├── data/
│   └── recipes.json
└── App.vue
```
