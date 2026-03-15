import { query } from '@/lib/db' ; 
// this is just a buncha functions to use 

export async function getFullRecipe(recipeId: number) {
  const queryText = `
    SELECT 
      r.id,
      r.title,
      -- Get Recipe Notes
      rn.notes AS recipe_notes,
      -- Bundle ingredients into a JSON array
      (SELECT json_agg(json_build_object('name', i.name, 'amount', ri.amount))
       FROM recipe_ingredients ri
       JOIN ingredients i ON i.id = ri.ingredient_id
       WHERE ri.recipe_id = r.id) AS ingredients,
      -- Bundle equipment into a JSON array
      (SELECT json_agg(json_build_object('title', e.title, 'care', e.care))
       FROM recipe_equipment re
       JOIN equipment e ON e.id = re.equipment_id
       WHERE re.recipe_id = r.id) AS equipment,
      -- Bundle techniques into a JSON array
      (SELECT json_agg(t.tech_name)
       FROM recipe_techniques rt
       JOIN techniques t ON t.id = rt.technique_id
       WHERE rt.recipe_id = r.id) AS techniques
    FROM recipes r
    LEFT JOIN recipe_notes rn ON r.id = rn.recipe_id
    WHERE r.id = $1;
  `;
  const result = await query(queryText, [recipeId]);
  return result.rows[0]; // Returns one clean object
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