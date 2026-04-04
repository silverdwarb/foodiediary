// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { 
  // Recipe functions
  createRecipe, 
  getFullRecipe, 
  updateRecipe, 
  deleteRecipe,
  searchRecipes,
  // Ingredient functions
  addIngredient, 
  getIngredient, 
  updateIngredient,
  searchIngredients,
  // Technique functions
  addTechnique,
  getTechnique,
  updateTechnique,
  searchTechniques,
  // Equipment functions
  addEquipment,
  getEquipment,
  updateEquipment,
  searchEquipment,
  // Flavor functions
  addFlavor,
  getFlavor,
  searchFlavors,
  // Cook Log functions
  createCookLog,
  getCookLog,
  updateCookLog,
  searchCookLogs,
  // Relation functions
  assignIngredientToRecipe,
  removeIngredientFromRecipe,
  linkRecipeTechnique,
  unlinkRecipeTechnique,
  linkRecipeEquipment,
  unlinkRecipeEquipment,
  linkRecipeFlavor,
  unlinkRecipeFlavor,
} from '@/lib/queries';
import {query} from '@/lib/db'
import { EntityType, Recipe, Ingredient, Technique, Equipment, Flavor, CookLog } from '@/lib/types';

// ============ GENERIC FETCH ============
// app/actions.ts

export async function fetchEntities(
  type: EntityType, 
  params?: { 
    search?: string; 
    filters?: Record<string, any>; 
    sort?: { key: string; direction: 'asc' | 'desc' };
    limit?: number;
    offset?: number;
  }
): Promise<any[]> { // ✅ Explicit return type - ALWAYS an array
  try {
    let result: any;
    switch (type) {
      case 'recipes':
        result = await searchRecipes(params);
        break;
      case 'ingredients':
        result = await searchIngredients(params);
        break;
      case 'techniques':
        result = await searchTechniques(params);
        break;
      case 'equipment':
        result = await searchEquipment(params);
        break;
      case 'flavors':
        result = await searchFlavors(params);
        break;
      case 'cook_logs':
        result = await searchCookLogs(params);
        break;
      default:
        return [];
    }
    
    // ✅ Normalize: extract .rows if it exists, otherwise return as-is
    return result?.rows ?? result ?? [];
  } catch (error) {
    console.error(`Failed to fetch ${type}:`, error);
    return []; // ✅ Plain array on error
  }
}

export async function fetchEntityById(type: EntityType, id: number) {
  try {
    switch (type) {
      case 'recipes':
        return await getFullRecipe(id);
      case 'ingredients':
        return await getIngredient(id);
      case 'techniques':
        return await getTechnique(id);
      case 'equipment':
        return await getEquipment(id);
      case 'flavors':
        return await getFlavor(id);
      case 'cook_logs':
        return await getCookLog(id);
      default:
        throw new Error(`Unknown entity type: ${type}`);
    }
  } catch (error) {
    console.error(`Failed to fetch ${type} ${id}:`, error);
    return null;
  }
}

// ============ CREATE ============
export async function handleCreateEntity(type: EntityType, data: any) {
  'use server';
  
  try {
    let result;
    switch (type) {
      case 'recipes':
        result = await createRecipe(data.title,data.notes);
        break;
      case 'ingredients':
        result = await addIngredient(data.name);
        break;
      case 'techniques':
        result = await addTechnique(data.tech_name, data.notes);
        break;
      case 'equipment':
        result = await addEquipment(data.title, data.notes, data.care);
        break;
      case 'flavors':
        result = await addFlavor(data.name);
        break;
      case 'cook_logs':
        result = await createCookLog(data.recipe_id, data.cook_date, data.rating, data.alterations, data.session_notes);
        break;
      default:
        throw new Error(`Unknown entity type: ${type}`);
    }
    
    revalidatePath('/'); // Refresh the table view
    return { success: true, data: result.rows?.[0] };
  } catch (error: any) {
    console.error(`Failed to create ${type}:`, error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

// ============ UPDATE ============
export async function handleUpdateEntity(type: EntityType, id: number, data: Partial<any>) {
  'use server';
  
  try {
    let result;
    switch (type) {
      case 'recipes':
        result = await updateRecipe(id, data);
        break;
      case 'ingredients':
        result = await updateIngredient(id, data);
        break;
      case 'techniques':
        result = await updateTechnique(id, data);
        break;
      case 'equipment':
        result = await updateEquipment(id, data);
        break;
      case 'cook_logs':
        result = await updateCookLog(id, data);
        break;
      case 'flavors':
        // Flavors are simple; just update name
        result = await query('UPDATE flavors SET name = $1 WHERE id = $2 RETURNING *', [data.name, id]);
        break;
      default:
        throw new Error(`Unknown entity type: ${type}`);
    }
    
    revalidatePath('/');
    return { success: true, data: result.rows?.[0] };
  } catch (error: any) {
    console.error(`Failed to update ${type} ${id}:`, error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

// ============ DELETE ============
export async function handleDeleteEntity(type: EntityType, id: number) {
  'use server';
  
  try {
    switch (type) {
      case 'recipes':
        await deleteRecipe(id);
        break;
      case 'ingredients':
        await query('DELETE FROM ingredients WHERE id = $1', [id]);
        break;
      case 'techniques':
        await query('DELETE FROM techniques WHERE id = $1', [id]);
        break;
      case 'equipment':
        await query('DELETE FROM equipment WHERE id = $1', [id]);
        break;
      case 'flavors':
        await query('DELETE FROM flavors WHERE id = $1', [id]);
        break;
      case 'cook_logs':
        await query('DELETE FROM cook_logs WHERE id = $1', [id]);
        break;
      default:
        throw new Error(`Unknown entity type: ${type}`);
    }
    
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to delete ${type} ${id}:`, error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

// ============ RELATIONS ============
export async function handleAddIngredientToRecipe(recipeId: number, ingredientId: number, amount: string) {
  'use server';
  try {
    await assignIngredientToRecipe(recipeId, ingredientId, amount);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function handleRemoveIngredientFromRecipe(recipeId: number, ingredientId: number) {
  'use server';
  try {
    await removeIngredientFromRecipe(recipeId, ingredientId);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function handleLinkRecipeTechnique(recipeId: number, techniqueId: number) {
  'use server';
  try {
    await linkRecipeTechnique(recipeId, techniqueId);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function handleUnlinkRecipeTechnique(recipeId: number, techniqueId: number) {
  'use server';
  try {
    await unlinkRecipeTechnique(recipeId, techniqueId);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function handleLinkRecipeEquipment(recipeId: number, equipmentId: number) {
  'use server';
  try {
    await linkRecipeEquipment(recipeId, equipmentId);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function handleLinkRecipeFlavor(recipeId: number, flavorId: number) {
  'use server';
  try {
    await linkRecipeFlavor(recipeId, flavorId);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============ SEARCH UTILS ============
// app/actions.ts

export async function quickSearch(
  query: string, 
  types: EntityType[] = ['recipes', 'ingredients', 'techniques']
): Promise<Record<string, any[]>> {
  const results: Record<string, any[]> = {};
  
  for (const type of types) {
    try {
      const items = await fetchEntities(type, { search: query, limit: 10 });
      // ✅ items is now guaranteed to be a plain array (no .rows)
      if (items.length > 0) {
        results[type] = items;
      }
    } catch (error) {
      console.warn(`Search failed for ${type}:`, error);
    }
  }
  
  return results;
}

// ============ STATS ============
export async function getDashboardStats() {
  'use server';
  try {
    const [recipes, ingredients, techniques, cookLogs] = await Promise.all([
      query('SELECT COUNT(*) FROM recipes'),
      query('SELECT COUNT(*) FROM ingredients'),
      query('SELECT COUNT(*) FROM techniques'),
      query('SELECT COUNT(*) FROM cook_logs'),
    ]);
    
    return {
      recipeCount: parseInt(recipes.rows[0].count),
      ingredientCount: parseInt(ingredients.rows[0].count),
      techniqueCount: parseInt(techniques.rows[0].count),
      cookLogCount: parseInt(cookLogs.rows[0].count),
    };
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return null;
  }
}