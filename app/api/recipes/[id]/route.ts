import { NextResponse } from 'next/server';
import { getRecipeWithIngredients } from '@/lib/queries';
import {query} from '@/lib/db'

// The 'params' argument automatically captures the [id] from the URL
export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Next.js 15+ syntax

  const data = await getRecipeWithIngredients(Number(id));
  
  if (data.rows.length === 0) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  }

  return NextResponse.json(data.rows);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // First, remove the links in the join table
  await query('DELETE FROM recipe_ingredients WHERE recipe_id = $1', [id]);
  // Then, delete the recipe itself
  const result = await query('DELETE FROM recipes WHERE id = $1', [id]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Recipe deleted successfully' });
}