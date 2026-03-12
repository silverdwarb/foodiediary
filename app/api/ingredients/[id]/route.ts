import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 1. Remove the relationship first so we don't break the database constraints
    await query('DELETE FROM recipe_ingredients WHERE ingredient_id = $1', [id]);
    
    // 2. Delete the ingredient itself
    const result = await query('DELETE FROM ingredients WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}