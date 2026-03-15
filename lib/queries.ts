import { query } from '@/lib/db' ; 
// this is just a buncha functions to use 

export async function getRecipeWithIngredients(recipeId: number) {
  // We join tables to fetch recipe details + ingredient names + amounts
  const queryText = `
    SELECT r.title, i.name, ri.amount 
    FROM recipes r
    JOIN recipe_ingredients ri ON r.id = ri.recipe_id
    JOIN ingredients i ON ri.ingredient_id = i.id
    WHERE r.id = $1;
  `;
  return await query(queryText, [recipeId]);
}

export async function addIngredient(name: string) {
  const lowerName = name.toLowerCase();
  // Try inserting
  const result = await query(
    'INSERT INTO ingredients (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id',
    [lowerName]
  );
  
  // If result.rows is empty, the ingredient already existed, so fetch its ID
  if (result.rows.length === 0) {
    const existing = await query('SELECT id FROM ingredients WHERE name = $1', [lowerName]);
    return existing.rows[0];
  }
  
  return result.rows[0];
}

export async function createRecipe(title: string) {
  return await query(
    'INSERT INTO recipes (title) VALUES ($1) RETURNING id',
    [title]
  );
}

export async function assignIngredientToRecipe(
  recipeId: number, 
  ingredientId: number, 
  amount: string
) {
  return await query(
    'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) VALUES ($1, $2, $3)',
    [recipeId, ingredientId, amount]
  );
}

// Add a new flavor
export async function addFlavor(name: string) {
  return await query(
    'INSERT INTO flavors (name) VALUES ($1) RETURNING *',
    [name]
  );
}

// Add a new technique with notes
export async function addTechnique(name: string, notes: string) {
  return await query(
    'INSERT INTO techniques (tech_name, notes) VALUES ($1, $2) RETURNING *',
    [name, notes]
  );
}

// Add equipment. Note: Pass care as a JSON object
export async function addEquipment(title: string, notes: string, care: object) {
  return await query(
    'INSERT INTO equipment (title, notes, care) VALUES ($1, $2, $3) RETURNING *',
    [title, notes, JSON.stringify(care)]
  );
}

// Link Recipe to Equipment
export async function linkRecipeEquipment(recipeId: number, equipmentId: number) {
  return await query(
    'INSERT INTO recipe_equipment (recipe_id, equipment_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [recipeId, equipmentId]
  );
}

// Link Recipe to Technique
export async function linkRecipeTechnique(recipeId: number, techniqueId: number) {
  return await query(
    'INSERT INTO recipe_techniques (recipe_id, technique_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [recipeId, techniqueId]
  );
}

// Link Recipe to Flavor
export async function linkRecipeFlavor(recipeId: number, flavorId: number) {
  return await query(
    'INSERT INTO recipe_flavors (recipe_id, flavor_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [recipeId, flavorId]
  );
}