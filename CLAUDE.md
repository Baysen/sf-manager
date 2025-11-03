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
1. **MUST** initialize with `window.HSStaticMethods.autoInit()` after route changes
2. **MUST** import both JS and CSS: `import 'preline/preline'` and `@import 'preline/preline.css'`
3. **MUST** reference official Preline UI documentation for component markup

**When in doubt, ALWAYS check the official documentation for the current version before writing code.**

## Core Features

### MVP (Phase 1)
1. Recipe management system with all Satisfactory recipes
2. Multi-location factory tracking
3. Production line management per location
4. Resource balance calculations per location
5. Overclocking support
6. Power consumption tracking
7. Local storage persistence
8. JSON export/import functionality

### Post-MVP (Phase 2)
- Resource flow tracking between locations
- Somersloop production multiplier support
- Recipe categorization by tier
- Recipe categorization by type (ore drilling, smelting, etc.)

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
  ]
}
```

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
    │   └── Add/Edit Production Line Modal
    │       ├── Recipe selector (searchable dropdown)
    │       ├── Machine count input
    │       ├── Overclocking configuration
    │       │   └── Dynamic list: [X machines at Y%]
    │       └── [Save] [Cancel]
    │
    └── Right Panel (30%)
        ├── Resource Summary Card
        │   └── For each resource involved:
        │       ├── Resource name
        │       ├── Production: +X/min (from local production/mining)
        │       ├── Consumption: -X/min (used by local recipes)
        │       ├── Balance: ±X/min
        │       └── Status indicator (text + color)
        │           ├── "Surplus" (green) - producing more than consuming
        │           ├── "Balanced" (yellow) - producing equal to consuming
        │           └── "Deficit" (red) - consuming more than producing
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
Production = sum of all outputs of that resource from all production lines
Consumption = sum of all inputs of that resource from all production lines
Balance = Production - Consumption

Status:
  if Balance > 0.1: "Surplus" (green)
  if Balance < -0.1: "Deficit" (red)
  if -0.1 <= Balance <= 0.1: "Balanced" (yellow)
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

## Future Considerations (Post-MVP)

### Inter-Location Resource Flow
- Track imports/exports between locations
- Visual indication of resource dependencies
- Global resource balance across all locations

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
