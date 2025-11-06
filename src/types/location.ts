export interface OverclockingConfig {
  count: number; // number of machines at this speed
  percentage: number; // 100, 150, 250, etc.
  somersloops?: number; // Number of somersloops per machine in this config
}

export interface ProductionLine {
  id: string;
  recipeId: string;
  machineCount: number;
  overclocking: OverclockingConfig[];
}

export interface ResourceExtractionLine {
  id: string;
  minerType: string; // miner-mk1, miner-mk2, oil-pump, water-extractor, etc.
  resourceType: string; // iron-ore, copper-ore, crude-oil, water, etc.
  purity: 'impure' | 'normal' | 'pure'; // node purity
  machineCount: number;
  overclocking: OverclockingConfig[];
}

export interface PowerGenerationLine {
  id: string;
  generatorType: string; // biomass-burner, coal-generator, fuel-generator, geothermal-generator, nuclear-power-plant
  recipeId?: string; // For fuel-based generators (optional for geothermal)
  machineCount: number;
  overclocking: OverclockingConfig[];
  connectedToGrid: boolean; // Whether this generator is connected to global power grid
  // For geothermal with variable power
  actualPower?: number; // Actual MW per generator (for variable power like geothermal)
}

export interface ResourceExport {
  id: string;
  resource: string;
  toLocationId: string;
  mode: 'percentage' | 'absolute';
  value: number; // percentage 0-100 or absolute amount per minute
}

export interface Location {
  id: string;
  name: string;
  pinned?: boolean; // Whether this location is pinned/favorited
  resourceExtractionLines: ResourceExtractionLine[];
  productionLines: ProductionLine[];
  powerGenerationLines: PowerGenerationLine[];
  exports: ResourceExport[];
}

export interface ImportDetail {
  fromLocationId: string;
  fromLocationName: string;
  amount: number;
}

export interface ExportDetail {
  toLocationId: string;
  toLocationName: string;
  amount: number;
}

export interface ResourceBalance {
  resource: string;
  production: number;
  consumption: number;
  imports: ImportDetail[];
  exports: ExportDetail[];
  balance: number;
  status: 'surplus' | 'balanced' | 'deficit';
}

export interface PowerBreakdown {
  machineType: string;
  consumption: number;
}

export interface PowerSummary {
  totalGeneration: number; // Total power generated (local + global grid)
  localGeneration: number; // Power generated locally (disconnected from grid)
  globalGridGeneration: number; // Power from global grid (connected generators across all locations)
  totalConsumption: number; // Total power consumed
  netPower: number; // (localGeneration + globalGridGeneration) - Consumption
  generationBreakdown: PowerBreakdown[]; // Breakdown by generator type (local only)
  consumptionBreakdown: PowerBreakdown[]; // Breakdown by consumer type
}
