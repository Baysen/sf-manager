# Satisfactory - Modular Factory Manager

A web application to track and manage multiple factory locations in Satisfactory, including production lines, resource extraction, resource flow between locations, and balance calculations.

## Features

### Current Features
- **Complete Recipe Database**: All Satisfactory recipes including alternate recipes
- **Multi-Location Factory Management**: Track and organize multiple factory locations
- **Production Line Planning**: Configure recipes, machine counts, and overclocking per location
- **Resource Extraction Tracking**: Manage miners and extractors with node purity and overclocking
- **Inter-Location Resource Flow**: Ship resources between locations using percentage or absolute export modes
- **Real-Time Balance Calculations**:
  - Automatic production and consumption tracking
  - Resource surplus/deficit analysis with import/export breakdown
  - Power consumption calculations with overclocking multipliers
- **Data Persistence**: Auto-save to browser storage with JSON export/import for backups
- **Visual Resource Icons**: Easy identification of all resources and machines
- **Clean Dark Mode Interface**: Intuitive UI built with modern components

### Planned Features (Phase 2)
- **Power Generation Tracking**: Add generators and track net power balance
- **Global Overview Dashboard**: See all locations and resource flows at a glance
- **Collapsible Sections**: Minimize sections to focus on what matters
- **Enhanced Location Management**: Better tools for organizing and managing locations

### Future Features (Phase 3+)
- **Smart Production Suggestions**: Automated optimization recommendations based on current surplus/deficit
- **Somersloop Multiplier Support**: Track production bonuses from somersloops
- **Production Goal Calculator**: Set a target output and get exact build requirements
- **Recipe Filtering**: Filter by tier and production category
- **URL Sharing**: Share factory configurations via link

### Stretch Goals
- **Save File Import**: Automatically import factory data from your Satisfactory save files

## Usage

If you just want to get started, you can use the online version at [https://baysen.github.io/sf-manager/]. All data is stored locally in your browser.

## Building it yourself

### Prerequisites
- Node.js (v20.19.0+ or v22.12.0+)
- npm

### Tech Stack
- **Vue 3** (Composition API)
- **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **Preline UI**
- **Pinia** (State Management)
- **Vue Router**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Baysen/sf-manager.git
   cd sf-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Managing Locations

1. **Create a Location**: Click the "+ Add Location" button in the Locations tab
2. **Add Resource Extraction**: Configure miners/extractors with purity counts and overclocking
3. **Add Production Lines**: Select recipes, set machine counts, and configure overclocking
4. **Export Resources**: Send surplus resources to other locations

### Resource Flow Between Locations

The app uses an **export-driven model**:
- Define exports from locations with surplus resources
- Imports are automatically calculated and displayed
- Choose between percentage (e.g., "60% of surplus") or absolute (e.g., "120/min") export modes

### Data Management

- **Auto-Save**: All changes are automatically saved to browser LocalStorage
- **Export Data**: Download your entire factory setup as a JSON file
- **Import Data**: Load a previously exported JSON file

## Contributing

Contributions are welcome! This is a community project for Satisfactory players.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

For third-party attributions, see [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

## Acknowledgments

- Built for the [Satisfactory](https://www.satisfactorygame.com/) community
- Recipe data and resource icons sourced from [Kirk McDonald's Satisfactory Calculator](https://github.com/KirkMcDonald/satisfactory-calculator) (Apache 2.0 License)
- Created with the assistance of CLAUDE Code. Hallucinations controlled to the best of my ability

## Disclaimer

This is a fan-made tool and is not affiliated with or endorsed by Coffee Stain Studios. Satisfactory is a trademark of Coffee Stain Studios AB.
