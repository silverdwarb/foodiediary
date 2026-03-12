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

