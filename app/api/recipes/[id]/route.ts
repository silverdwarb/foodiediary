import { NextResponse } from 'next/server';
import { getFullRecipe } from '@/lib/queries';
import { query } from '@/lib/db';

export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const recipe = await getFullRecipe(Number(id));
  
  // Since 'recipe' is now the object (or undefined), check for existence directly
  if (!recipe) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  }

  // Return the object directly
  return NextResponse.json(recipe);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Just delete the recipe. Let the database handle the rest via CASCADE.
  // This is much faster and less error-prone.
  const result = await query('DELETE FROM recipes WHERE id = $1', [Number(id)]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Recipe deleted successfully' });
}