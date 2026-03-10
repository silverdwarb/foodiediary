import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// Notice the 'export async function GET' part
export async function GET() {
  try {
    const result = await query('SELECT * FROM recipes');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}