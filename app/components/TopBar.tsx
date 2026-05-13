'use client';

import { EntityType } from '@/lib/types';

interface TopBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedType: EntityType;
  setSelectedType: (val: EntityType) => void;
  onAddNew: () => void;
}

export default function TopBar({ 
  searchQuery, setSearchQuery, 
  selectedType, setSelectedType, 
  onAddNew 
}: TopBarProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      {/* Search Input */}
      <input 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="..."
      />
      
      {/* Type Selector */}
      <select 
        value={selectedType} 
        onChange={(e) => setSelectedType(e.target.value as EntityType)}
        className="..."
      >
        <option value="recipes">Recipes</option>
        <option value="ingredients">Ingredients</option>
        {/* ... others */}
      </select>

      <button onClick={onAddNew} className="...">
        Add New
      </button>
    </div>
  );
}