# Feature Roadmap

## Phase 2 (In Progress)
- [x] Alphabetical sorting of all lists
- [x] Somersloop production multiplier support
- [x] Better visualization of alternate recipes in dropdowns
- [x] Split resource and recipe selection into separate dropdowns
- [x] Add power creation machines
- [x] Limit resource extraction machines to the resources they can actually extract
- [ ] Grouping of production machines
- [ ] Ability to switch off production lines and/or whole groups
- [ ] Overview page summarizing all locations
- [x] Accordion-like functionality to collapse sections (Resource Extraction, etc.)
- [ ] Manual grouping of locations (+ drag and drop)

## Phase 3 (Cloud Sharing)
- [ ] **Factory Sharing System**
  - Provider-agnostic storage architecture (interface-based design)
  - GitHub Gists provider with Device Flow authentication
  - Share factories with unique URLs (`?share=gh:gist_id` with provider prefix)
  - Update existing shares (authenticated users only)
  - List and manage user's shared factories
  - Fork/import shared factories to local storage
  - Share modal UI with login flow

## Phase 4 (Future Enhancements)
- Enhanced resource flow visualization
- Optimization suggestions:
  - Small surplus corrections (e.g., 15 iron ore → suggest overclocking to 150%)
  - Deficit improvements based on resource source (local extraction vs import)
  - Maximum capacity suggestions with "ghost entries"
- Recipe categorization by tier (1-8)
- Category tags (Mining, Smelting, Construction, etc.)
- Compact mode (tighter layouts)
- Drag and drop sorting
- "Path to resource goal" - calculate exact machines needed to reach production target
- i18n support

## Stretch Goals
- Save file import: Parse saves to import locations from train/truck stations and drone pads
- Connected machine discovery: Find and import all machines connected to stations
