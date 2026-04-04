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

// lib/queries.ts

export async function addIngredient(name: string) {
  const lowerName = name.toLowerCase();
  
  const result = await query(
    'INSERT INTO ingredients (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id',
    [lowerName]
  );
  
  // ✅ Check result.rows.length (not result.length)
  if (result.rows.length === 0) {
    const existing = await query('SELECT id FROM ingredients WHERE name = $1', [lowerName]);
    return existing.rows[0]; // ✅ Return plain object
  }
  
  return result.rows[0]; // ✅ Return plain object
}

export async function searchIngredients(params?: { search?: string; limit?: number }) {
  let queryText = 'SELECT i.*, inotes.notes FROM ingredients i LEFT JOIN ingredient_notes inotes ON i.id = inotes.ingredient_id';
  const values: any[] = [];
  
  if (params?.search) {
    values.push(`%${params.search}%`);
    queryText += ' WHERE i.name ILIKE $' + values.length;
  }
  
  if (params?.limit) queryText += ` LIMIT ${params.limit}`;
  
  const result = await query(queryText, values);
  return result.rows; // ✅ Return plain array, not QueryResult
}

// lib/queries.ts
export async function createRecipe(title: string, notes?: string) {
  // Step 1: Insert the recipe (title only)
  const recipeResult = await query(
    'INSERT INTO recipes (title) VALUES ($1) RETURNING id',
    [title]
  );
  const recipeId = recipeResult.rows[0].id;
  
  // Step 2: Insert notes if provided (separate table)
  if (notes && notes.trim()) {
    await query(
      `INSERT INTO recipe_notes (recipe_id, notes) VALUES ($1, $2)`,
      [recipeId, notes]
    );
  }
  
  // Step 3: Return the complete recipe with notes joined
  const fullRecipe = await query(
    `SELECT r.id, r.title, rn.notes 
     FROM recipes r 
     LEFT JOIN recipe_notes rn ON r.id = rn.recipe_id 
     WHERE r.id = $1`,
    [recipeId]
  );
  
  return fullRecipe;
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

// lib/queries.ts additions

// ===== RECIPES =====
// lib/queries.ts
export async function updateRecipe(id: number, data: Partial<{ title: string; notes: string }>) {
  // Step 1: Update the recipe title (if provided)
  if (data.title) {
    await query(
      `UPDATE recipes SET title = $1 WHERE id = $2`,
      [data.title, id]
    );
  }
  
  // Step 2: Handle notes via the separate recipe_notes table (UPSERT)
  if (data.notes !== undefined) {
    if (data.notes && data.notes.trim()) {
      // Insert or update notes
      await query(
        `INSERT INTO recipe_notes (recipe_id, notes) 
         VALUES ($1, $2)
         ON CONFLICT (recipe_id) 
         DO UPDATE SET notes = $2`,
        [id, data.notes]
      );
    } else {
      // If notes are empty/null, delete the notes row
      await query(
        `DELETE FROM recipe_notes WHERE recipe_id = $1`,
        [id]
      );
    }
  }
  
  // Step 3: Return the updated recipe with notes joined
  const updatedRecipe = await query(
    `SELECT r.id, r.title, rn.notes 
     FROM recipes r 
     LEFT JOIN recipe_notes rn ON r.id = rn.recipe_id 
     WHERE r.id = $1`,
    [id]
  );
  
  return updatedRecipe;
}

export async function deleteRecipe(id: number) {
  return await query('DELETE FROM recipes WHERE id = $1', [id]);
}

export async function searchRecipes(params?: { search?: string; filters?: any; sort?: any; limit?: number; offset?: number }) {
  let queryText = 'SELECT r.id, r.title, rn.notes FROM recipes r LEFT JOIN recipe_notes rn ON r.id = rn.recipe_id';
  const values: any[] = [];
  let whereClauses: string[] = [];
  
  if (params?.search) {
    values.push(`%${params.search}%`);
    whereClauses.push('(r.title ILIKE $' + values.length + ' OR rn.notes ILIKE $' + values.length + ')');
  }
  
  if (whereClauses.length > 0) {
    queryText += ' WHERE ' + whereClauses.join(' AND ');
  }
  
  if (params?.sort?.key) {
    queryText += ` ORDER BY ${params.sort.key} ${params.sort.direction.toUpperCase()}`;
  }
  
  if (params?.limit) {
    queryText += ` LIMIT ${params.limit}`;
    if (params?.offset) queryText += ` OFFSET ${params.offset}`;
  }
  
  return await query(queryText, values);
}

// ===== INGREDIENTS =====
export async function getIngredient(id: number) {
  return await query(
    `SELECT i.*, inotes.notes 
     FROM ingredients i 
     LEFT JOIN ingredient_notes inotes ON i.id = inotes.ingredient_id 
     WHERE i.id = $1`,
    [id]
  );
}

export async function updateIngredient(id: number, data: Partial<{ name: string; notes: string }>) {
  // Update ingredients table
  if (data.name) {
    await query('UPDATE ingredients SET name = $1 WHERE id = $2', [data.name, id]);
  }
  // Upsert notes
  if (data.notes !== undefined) {
    await query(
      `INSERT INTO ingredient_notes (ingredient_id, notes) VALUES ($1, $2)
       ON CONFLICT (ingredient_id) DO UPDATE SET notes = $2`,
      [id, data.notes]
    );
  }
  return await query('SELECT * FROM ingredients WHERE id = $1', [id]);
}


// ===== TECHNIQUES =====
export async function getTechnique(id: number) {
  return await query('SELECT * FROM techniques WHERE id = $1', [id]);
}

export async function updateTechnique(id: number, data: Partial<{ tech_name: string; notes: string }>) {
  const updates = Object.entries(data)
    .map(([key, val], i) => `${key} = $${i + 2}`)
    .join(', ');
  const values = [id, ...Object.values(data)];
  
  return await query(
    `UPDATE techniques SET ${updates} WHERE id = $1 RETURNING *`,
    values
  );
}

export async function searchTechniques(params?: { search?: string; limit?: number }) {
  let queryText = 'SELECT * FROM techniques';
  const values: any[] = [];
  
  if (params?.search) {
    values.push(`%${params.search}%`);
    queryText += ' WHERE tech_name ILIKE $' + values.length;
  }
  
  if (params?.limit) queryText += ` LIMIT ${params.limit}`;
  
  return await query(queryText, values);
}

// ===== EQUIPMENT =====
export async function getEquipment(id: number) {
  return await query('SELECT * FROM equipment WHERE id = $1', [id]);
}

export async function updateEquipment(id: number, data: Partial<{ title: string; notes: string; care: any }>) {
  const updates = Object.entries(data)
    .map(([key, val], i) => {
      if (key === 'care') return `${key} = $${i + 2}::jsonb`;
      return `${key} = $${i + 2}`;
    })
    .join(', ');
  const values = [id, ...Object.values(data)];
  
  return await query(
    `UPDATE equipment SET ${updates} WHERE id = $1 RETURNING *`,
    values
  );
}

export async function searchEquipment(params?: { search?: string; limit?: number }) {
  let queryText = 'SELECT * FROM equipment';
  const values: any[] = [];
  
  if (params?.search) {
    values.push(`%${params.search}%`);
    queryText += ' WHERE title ILIKE $' + values.length;
  }
  
  if (params?.limit) queryText += ` LIMIT ${params.limit}`;
  
  return await query(queryText, values);
}

// ===== FLAVORS =====
export async function getFlavor(id: number) {
  return await query('SELECT * FROM flavors WHERE id = $1', [id]);
}

export async function searchFlavors(params?: { search?: string; limit?: number }) {
  let queryText = 'SELECT * FROM flavors';
  const values: any[] = [];
  
  if (params?.search) {
    values.push(`%${params.search}%`);
    queryText += ' WHERE name ILIKE $' + values.length;
  }
  
  if (params?.limit) queryText += ` LIMIT ${params.limit}`;
  
  return await query(queryText, values);
}

// ===== COOK LOGS =====
export async function createCookLog(
  recipe_id: number, 
  cook_date?: string, 
  rating?: number, 
  alterations?: any, 
  session_notes?: string
) {
  return await query(
    `INSERT INTO cook_logs (recipe_id, cook_date, rating, alterations, session_notes) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [recipe_id, cook_date || new Date(), rating, alterations ? JSON.stringify(alterations) : null, session_notes]
  );
}

export async function getCookLog(id: number) {
  const result = await query(
    `SELECT cl.*, r.title as recipe_title 
     FROM cook_logs cl 
     LEFT JOIN recipes r ON cl.recipe_id = r.id 
     WHERE cl.id = $1`,
    [id]
  );
  return result.rows[0];
}

export async function updateCookLog(id: number, data: Partial<{ rating: number; alterations: any; session_notes: string }>) {
  const updates = Object.entries(data)
    .map(([key, val], i) => {
      if (key === 'alterations') return `${key} = $${i + 2}::jsonb`;
      return `${key} = $${i + 2}`;
    })
    .join(', ');
  const values = [id, ...Object.values(data)];
  
  return await query(
    `UPDATE cook_logs SET ${updates} WHERE id = $1 RETURNING *`,
    values
  );
}

export async function searchCookLogs(params?: { search?: string; filters?: { recipe_id?: number; rating?: number; date_from?: string; date_to?: string }; limit?: number }) {
  let queryText = `
    SELECT cl.*, r.title as recipe_title 
    FROM cook_logs cl 
    LEFT JOIN recipes r ON cl.recipe_id = r.id
  `;
  const values: any[] = [];
  const whereClauses: string[] = [];
  let paramIndex = 1;
  
  if (params?.filters?.recipe_id) {
    values.push(params.filters.recipe_id);
    whereClauses.push(`cl.recipe_id = $${paramIndex++}`);
  }
  
  if (params?.filters?.rating) {
    values.push(params.filters.rating);
    whereClauses.push(`cl.rating = $${paramIndex++}`);
  }
  
  if (params?.filters?.date_from) {
    values.push(params.filters.date_from);
    whereClauses.push(`cl.cook_date >= $${paramIndex++}`);
  }
  
  if (params?.filters?.date_to) {
    values.push(params.filters.date_to);
    whereClauses.push(`cl.cook_date <= $${paramIndex++}`);
  }
  
  if (params?.search) {
    values.push(`%${params.search}%`);
    whereClauses.push(`(r.title ILIKE $${paramIndex} OR cl.session_notes ILIKE $${paramIndex})`);
    paramIndex++;
  }
  
  if (whereClauses.length > 0) {
    queryText += ' WHERE ' + whereClauses.join(' AND ');
  }
  
  queryText += ' ORDER BY cl.cook_date DESC';
  
  if (params?.limit) {
    queryText += ` LIMIT ${params.limit}`;
  }
  
  return await query(queryText, values);
}

// ===== RELATION HELPERS =====
export async function removeIngredientFromRecipe(recipeId: number, ingredientId: number) {
  return await query(
    'DELETE FROM recipe_ingredients WHERE recipe_id = $1 AND ingredient_id = $2',
    [recipeId, ingredientId]
  );
}

export async function unlinkRecipeTechnique(recipeId: number, techniqueId: number) {
  return await query(
    'DELETE FROM recipe_techniques WHERE recipe_id = $1 AND technique_id = $2',
    [recipeId, techniqueId]
  );
}

export async function unlinkRecipeEquipment(recipeId: number, equipmentId: number) {
  return await query(
    'DELETE FROM recipe_equipment WHERE recipe_id = $1 AND equipment_id = $2',
    [recipeId, equipmentId]
  );
}

export async function unlinkRecipeFlavor(recipeId: number, flavorId: number) {
  return await query(
    'DELETE FROM recipe_flavors WHERE recipe_id = $1 AND flavor_id = $2',
    [recipeId, flavorId]
  );
}