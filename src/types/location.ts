export interface OverclockingConfig {
  count: number; // number of machines at this speed
  percentage: number; // 100, 150, 250, etc.
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
  resourceExtractionLines: ResourceExtractionLine[];
  productionLines: ProductionLine[];
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
