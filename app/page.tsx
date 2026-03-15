'use client';
import { useState, useEffect } from 'react';

interface Recipe {
  id: number;
  title: string;
}

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all recipes on mount
  useEffect(() => {
    fetch('/api/recipes')
      .then((res) => res.json())
      .then((data) => {
        setRecipes(data);
        setLoading(false);
      });
  }, []);

  // Add a recipe
  const addRecipe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = formData.get('title') as string;

    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });

    if (res.ok) {
      const newRecipe = await res.json();
      // Update state immediately without reloading
      setRecipes([...recipes, newRecipe]);
      form.reset();
    }
  };

  // Delete a recipe
  const deleteRecipe = async (id: number) => {
    // 1. Optimistic update: remove locally immediately
    const previousRecipes = [...recipes];
    setRecipes(recipes.filter((r) => r.id !== id));

    const response = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });

    // 2. If it failed, put the items back
    if (!response.ok) {
      alert('Failed to delete recipe');
      setRecipes(previousRecipes);
    }
  };

  if (loading) return <p>Loading your diary...</p>;

  return (
    <div>
      <h1><center>My Foodie Diary</center></h1>
      
      <form onSubmit={addRecipe}>
        <input name="title" placeholder="New Recipe Name" required />
        <button type="submit">Add Recipe</button>
      </form>

      <ul>
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            {recipe.title}
            <button onClick={() => deleteRecipe(recipe.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}