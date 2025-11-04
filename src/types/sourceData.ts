// Types for the raw data from Kirk McDonald's calculator

export interface SourceBuilding {
  name: string;
  key_name: string;
  category: string;
  power: number; // MW
  somersloop_slots: number | null;
  max: number; // max somersloop multiplier
}

export interface SourceMiner {
  name: string;
  key_name: string;
  category: string;
  power: number; // MW
  base_rate: number; // per minute
}

export interface SourceItem {
  name: string;
  key_name: string;
  tier?: number;
  stack_size?: number;
}

export interface SourceFluid {
  name: string;
  key_name: string;
  tier?: number;
}

export interface SourceRecipe {
  name: string;
  key_name: string;
  category: string; // building category
  time: number; // seconds
  ingredients: Array<[string, number]>; // [item_key, quantity]
  products: Array<[string, number]>; // [item_key, quantity]
  power_range?: Array<number>; // optional for variable power recipes
}

export interface SourceResource {
  key_name: string;
  category: 'mineral' | 'oil' | 'water';
  priority: number;
  weight?: number;
}

export interface SourceData {
  belts: unknown[];
  pipes: unknown[];
  buildings: SourceBuilding[];
  miners: SourceMiner[];
  items: SourceItem[];
  fluids: SourceFluid[];
  resources: SourceResource[];
  recipes: SourceRecipe[];
}
