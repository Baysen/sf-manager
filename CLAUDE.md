# Satisfactory Factory Manager

A web application to track and manage multiple factory locations in Satisfactory, including production lines, resource flow, and balance calculations.

## Tech Stack
- **Frontend**: Vue.js 3.5.13 (Composition API with `<script setup>`)
- **Build Tool**: Vite
- **UI Library**: shadcn-vue (Reka UI + Tailwind CSS v4.0)
- **Data Persistence**: LocalStorage with JSON export/import
- **Language**: TypeScript

### Version-Specific Requirements

#### Tailwind CSS v4
1. Use `@tailwindcss/vite` plugin (NOT PostCSS)
2. Use `@import "tailwindcss";` in CSS (NOT `@tailwind` directives)
3. Use `@plugin` directive for plugins
4. NO `tailwind.config.js` - v4 uses CSS-based configuration

#### Vue 3
1. Use Composition API with `<script setup>`
2. Use TypeScript for all component logic
3. Avoid Options API unless necessary

#### shadcn-vue
1. Use Tailwind CSS v4.0 (see [docs](https://www.shadcn-vue.com/docs/tailwind-v4.html))
2. Copy components into `src/components/ui/` using CLI
3. Configure path aliases: `@/` → `./src/`
4. CLI tool only - NOT an npm package

**Always check official documentation for current version patterns.**

## Core Features

### Implemented (Phase 1 & 2)
- Recipe management with all Satisfactory recipes
- Multi-location factory tracking
- Production line management with overclocking
- Resource extraction with miner types and purity
- Power generation with global grid system
- Resource balance calculations
- Resource flow tracking between locations
- Location management (pin, edit, delete)
- Somersloop production multiplier support
- LocalStorage persistence with data migration
- JSON export/import
- Resource and machine icons
- Collapsible sidebar navigation
- Alphabetical sorting

### Planned Features
See [docs/roadmap.md](docs/roadmap.md) for detailed roadmap.

## Architecture

### Data Structures
See [docs/data-structures.md](docs/data-structures.md) for complete data schemas.

**Key Concepts:**
- Recipes are read-only from `source-data.json`
- Locations contain production lines, resource extractions, power generation, and exports
- Imports are automatically calculated from other locations' exports
- Overclocking uses dynamic configurations per line
- Power generators have global grid connectivity option

### Business Logic
See [docs/calculations.md](docs/calculations.md) for all formulas.

**Key Calculations:**
- Production rates with overclocking
- Power consumption (1.6 exponent curve)
- Somersloop multipliers (2^count)
- Resource balance (production + imports - consumption - exports)
- Export validation (percentage and absolute modes)

### Data Persistence
- **LocalStorage Keys:**
  - `satisfactory-manager-locations`: Location data
  - `satisfactory-manager-version`: Data format version
  - `satisfactory-manager-settings`: App settings
- **Auto-save**: On every change
- **Migration**: Automatic version detection and migration
- **Export/Import**: JSON format with validation

See [docs/migration-guide.md](docs/migration-guide.md) for migration rules and history.

## UI & Design

### Layout
See [docs/ui-layout.md](docs/ui-layout.md) for complete layout hierarchy.

**Structure:**
- Collapsible sidebar: Navigation, locations list, export/import
- Main content: Location details (70% left panel + 30% right summary panel)
- Pinned locations appear at top of sidebar
- Resource and power summaries in right panel

### Design System (shadcn-vue)

**Why shadcn-vue?**
- Vue 3 native with proper lifecycle management
- Copy-paste components (full control)
- Tailwind CSS v4 first-class support
- Accessible (Reka UI primitives)
- Full TypeScript support

**Components Used:**
- Layout: Sidebar, Card
- Forms: Dialog, Select, Input, Label, Button
- Display: Badge, Separator
- Icons: Lucide Vue Next

**Theme:**
- CSS variables in `src/assets/main.css`
- OKLCH color space
- Dark mode by default
- Responsive prefixes required for overrides (see [docs/code-examples.md](docs/code-examples.md))

## Development Guidelines

### Code Patterns
See [docs/code-examples.md](docs/code-examples.md) for examples.

**General:**
- Use Vue 3 Composition API with `<script setup>`
- TypeScript for type safety
- Modular, reusable components
- Responsive design (mobile-friendly)
- Lucide icons for consistency

**Utilities:**
- Use `formatRate()` from `@/lib/formatters` for all number formatting
- Never use `.toFixed(1)` directly
- Always use responsive prefixes when overriding shadcn-vue component classes

### File Structure
```
src/
├── components/
│   ├── ui/              # shadcn-vue components
│   ├── locations/       # Location-specific components
│   ├── recipes/         # Recipe browser components
│   └── common/          # Shared components (ResourceIcon, etc.)
├── composables/         # Vue composables (business logic)
├── types/               # TypeScript definitions
├── lib/                 # Utility functions
├── data/                # Static data (source-data.json)
└── assets/              # Styles (main.css with Tailwind config)
```

## Key Systems

### Resource Flow (Export-Driven Model)
- Locations define what they **export** to other locations
- Imports are automatically calculated from other locations' exports
- Two modes: Percentage (recommended) or Absolute
- Validation ensures no over-exporting

### Power Grid System
- Generators can connect to global grid or power only local location
- `connectedToGrid: true` = contributes to global pool
- Global power shared across all locations
- Local-only generators for backup power
- Fuel-based generators integrate with resource balance (fuel consumption, waste production)

### Location Management
- **Pin**: Keep important locations at top of sidebar
- **Edit**: Rename locations via modal
- **Delete**: Confirmation dialog to prevent accidents

### Data Migration
See [docs/migration-guide.md](docs/migration-guide.md) for complete guide.

**Critical Rules:**
- Always support old data format versions
- Increment version for breaking changes
- Implement migration functions in `useMigrations.ts`
- Never remove old migration code
- Test thoroughly with real exports

## Power Generator Types
1. Biomass Burner (30 MW)
2. Coal Generator (75 MW)
3. Fuel Generator (150 MW)
4. Geothermal Generator (200 MW base, variable 50-600 MW)
5. Nuclear Power Plant (2500 MW)

## Resource Data Source
- Recipes and machines in `src/data/source-data.json`
- Loaded on app initialization
- Read-only in the app

## Reference Documentation
- [Data Structures](docs/data-structures.md)
- [Calculations](docs/calculations.md)
- [UI Layout](docs/ui-layout.md)
- [Code Examples](docs/code-examples.md)
- [Migration Guide](docs/migration-guide.md)
- [Roadmap](docs/roadmap.md)
