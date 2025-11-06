export interface RecipeResource {
  resource: string;
  amount: number; // per minute
}

export interface Recipe {
  id: string;
  name: string;
  baseName?: string; // For alternate recipes, the primary output resource name
  machine: string;
  isAlternate: boolean;
  inputs: RecipeResource[];
  outputs: RecipeResource[];
  powerConsumption: number; // MW per machine at 100%
  somersloopSlots: number | null; // Max somersloops this machine can hold (null if not supported)
}
