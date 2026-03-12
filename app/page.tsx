'use client';
import { useEffect, useState } from 'react';

// Define a type to avoid using 'any'
interface Recipe {
  id: number;
  title: string;
}

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    fetch('/api/recipes')
      .then((res) => res.json())
      .then((data) => setRecipes(data));
  }, []);

  const addRecipe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    
    await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    
    window.location.reload(); 
  };

  // Correctly target the recipe API route
  const deleteRecipe = async (id: number) => {
    const response = await fetch(`/api/recipes/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      window.location.reload();
    } else {
      alert('Failed to delete recipe');
    }
  };

  return (
    <div>
      <h1> <center>My Foodie Diary </center></h1>
      
      <form onSubmit={addRecipe}>
        <input name="title" placeholder="New Recipe Name" required />
        <button type="submit">Add Recipe</button>
      </form>

      <ul>
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            {recipe.title}
            <button onClick={() => deleteRecipe(recipe.id)}>Delete Recipe</button>
          </li>
        ))}
      </ul>
    </div>
  );
}