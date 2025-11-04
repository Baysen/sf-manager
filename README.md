# Satisfactory - Modular Factory Manager

A web application to track and manage multiple factory locations in Satisfactory, including production lines, resource extraction, resource flow between locations, and balance calculations.

## Features

### Current Features (MVP Phase)
- **Complete Recipe Database**: All Satisfactory recipes included
- **Multi-Location Management**: Track multiple factory locations independently
- **Production Lines**: Configure production lines with machine counts and overclocking
- **Resource Extraction**: Track miners and extractors with purity levels and overclocking
- **Resource Flow**: Export resources between locations with percentage or absolute amounts
- **Real-Time Calculations**:
  - Production and consumption rates per location
  - Resource balance (surplus/deficit) with import/export tracking
  - Power consumption with overclocking multipliers
- **Data Persistence**: LocalStorage with JSON export/import functionality
- **Resource Icons**: Visual icons for all Satisfactory resources
- **Dark Mode UI**: Built with Preline UI components

### Planned Features
- **Overview Dashboard**: Summary view of all locations and resource flow
- **Optimization Suggestions**: Automated recommendations for production improvements
- **Somersloop Support**: Production multiplier tracking
- **Recipe Categorization**: Filter by tier and category

## Tech Stack

- **Vue 3** (Composition API)
- **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **Preline UI**
- **Pinia** (State Management)
- **Vue Router**

## Getting Started

### Prerequisites
- Node.js (v20.19.0+ or v22.12.0+)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sf-manager.git
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
