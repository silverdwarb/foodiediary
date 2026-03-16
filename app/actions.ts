'use server';
import { createRecipe, getFullRecipe } from '@/lib/queries'; // Adjust import path

export async function handleCreateRecipe(title: string) {
  const result = await createRecipe(title);
  return result.rows[0].id;
}

export async function fetchFullRecipe(id: number) {
  return await getFullRecipe(id);
}