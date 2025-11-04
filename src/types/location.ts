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

export interface Location {
  id: string;
  name: string;
  productionLines: ProductionLine[];
}

export interface ResourceBalance {
  resource: string;
  production: number;
  consumption: number;
  balance: number;
  status: 'surplus' | 'balanced' | 'deficit';
}

export interface PowerBreakdown {
  machineType: string;
  consumption: number;
}
