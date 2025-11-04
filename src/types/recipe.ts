export interface RecipeResource {
  resource: string;
  amount: number; // per minute
}

export interface Recipe {
  id: string;
  name: string;
  machine: string;
  isAlternate: boolean;
  inputs: RecipeResource[];
  outputs: RecipeResource[];
  powerConsumption: number; // MW per machine at 100%
}
