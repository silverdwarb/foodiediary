// app/types.ts

export interface Ingredient {
  id: number;
  name: string;
  notes?: string | null;
}

export interface Recipe {
  id: number;
  title: string;
  notes?: string | null;
  ingredients?: Array<{ name: string; amount: number | null }>;
  equipment?: Array<{ title: string; care: any }>;
  techniques?: string[];
  flavors?: string[];
}

export interface Technique {
  id: number;
  tech_name: string;
  notes?: string | null;
}

export interface Equipment {
  id: number;
  title: string;
  care?: any;
  notes?: string | null;
}

export interface Flavor {
  id: number;
  name: string;
}

export interface CookLog {
  id: number;
  recipe_id: number;
  cook_date: string;
  rating?: number | null;
  alterations?: any;
  session_notes?: string | null;
  recipe_title?: string; // Optional join field
}

export type EntityType = 'recipes' | 'ingredients' | 'techniques' | 'equipment' | 'flavors' | 'cook_logs';

export type TableEntity = Ingredient | Recipe | Technique | Equipment | Flavor | CookLog;