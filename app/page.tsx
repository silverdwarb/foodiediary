'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  return (
    <div style={{ display: 'flex', height: '100vh', gap: '20px' }}>
      {/* Sidebar - Your List */}
      <aside style={{ width: '300px', borderRight: '1px solid #ddd', padding: '10px' }}>
        <h2>My Diary</h2>
        <ul>
           {/* Your recipe list items here */}
        </ul>
      </aside>

      {/* Main Window */}
      <main style={{ flex: 1, padding: '20px' }}>
        
        {/* Grid of Action Buttons */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '10px', 
          marginBottom: '30px' 
        }}>
          <button onClick={() => {/* Open Add Recipe Modal */}}>+ New Recipe</button>
          <button onClick={() => {/* Open Add Ingredient Modal */}}>+ Add Ingredient</button>
        </div>

        {/* The "Popout" / Detail View */}
        <section style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px' }}>
          {selectedRecipe ? (
            <div>
               <h1>{selectedRecipe.title}</h1>
               {/* Display details */}
            </div>
          ) : (
            <p>Select a recipe to view details or click an action button above.</p>
          )}
        </section>
      </main>
    </div>
  );
}