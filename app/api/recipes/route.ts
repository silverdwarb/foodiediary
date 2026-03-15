import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getFullRecipe } from '@/lib/queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  // Otherwise, fetch all recipes
  try {
    const result = await query('SELECT * FROM recipes');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
export async function POST(request: Request) {
  const { title } = await request.json();
  const result = await query('INSERT INTO recipes (title) VALUES ($1) RETURNING id', [title]);
  return NextResponse.json(result.rows[0], { status: 201 });
}