'use client';
import { useState, useEffect, useMemo } from 'react';
import { fetchFullRecipe, handleCreateRecipe} from './actions';
import { EntityType, TableEntity, Recipe, Ingredient, Technique, Equipment, Flavor, CookLog } from '@/lib/types';
import './globals.css';

// Column definitions for each entity type
const COLUMNS: Record<EntityType, Array<{ key: string; label: string; sortable?: boolean }>> = {
  recipes: [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'ingredients', label: 'Ingredients' },
    { key: 'techniques', label: 'Techniques' },
  ],
  ingredients: [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'notes', label: 'Notes' },
  ],
  techniques: [
    { key: 'id', label: 'ID' },
    { key: 'tech_name', label: 'Technique', sortable: true },
    { key: 'notes', label: 'Notes' },
  ],
  equipment: [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Name', sortable: true },
    { key: 'care', label: 'Care' },
  ],
  flavors: [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Flavor', sortable: true },
  ],
  cook_logs: [
    { key: 'id', label: 'ID' },
    { key: 'recipe_title', label: 'Recipe' },
    { key: 'cook_date', label: 'Date', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true },
  ],
};

export default function FoodieDiary() {
  const [entities, setEntities] = useState<TableEntity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<TableEntity | null>(null);
  const [currentType, setCurrentType] = useState<EntityType>('recipes');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch entities when type or filters change
  useEffect(() => {
    const fetchEntities = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API calls based on currentType
        // Example: const data = await fetchRecipes({ search: searchQuery, filters });
        // For now, mock data:
        const mockData: TableEntity[] = currentType === 'recipes' 
          ? [{ id: 1, title: 'Pasta Carbonara', notes: 'Classic Roman dish' }] 
          : [];
        setEntities(mockData);
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEntities();
  }, [currentType, searchQuery, filters]);

  // Filter and sort entities client-side (for demo; do server-side in production)
  const filteredEntities = useMemo(() => {
    let result = [...entities];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(entity => 
        Object.values(entity).some(val => 
          String(val).toLowerCase().includes(query)
        )
      );
    }
    
    // Attribute filters (example: rating >= 4)
    if (filters.rating) {
      result = result.filter(e => (e as any).rating >= filters.rating);
    }
    
    // Sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = (a as any)[sortConfig.key];
        const bVal = (b as any)[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }, [entities, searchQuery, filters, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleEntitySelect = (entity: TableEntity) => {
    setSelectedEntity(entity);
  };

  const handleSave = async () => {
    if (!selectedEntity) return;
    // TODO: Call appropriate update API based on currentType
    console.log('Saving:', selectedEntity);
  };

  return (
    <div className="fd-container">
      
      {/* Top Bar: Search + Entity Selector + Filters */}
      <header className="fd-topbar">
        <div className="fd-search-wrapper">
          <span className="fd-search-icon">🔍</span>
          <input
            type="text"
            placeholder={`Search ${currentType}...`}
            className="fd-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="fd-entity-selector">
          <select 
            value={currentType}
            onChange={(e) => {
              setCurrentType(e.target.value as EntityType);
              setSelectedEntity(null);
              setFilters({});
            }}
            className="fd-select"
          >
            <option value="recipes">📖 Recipes</option>
            <option value="ingredients">🥕 Ingredients</option>
            <option value="techniques">🔪 Techniques</option>
            <option value="equipment">🍳 Equipment</option>
            <option value="flavors">👅 Flavors</option>
            <option value="cook_logs">📝 Cook Logs</option>
          </select>
        </div>
        
        <button className="fd-filter-btn" onClick={() => {}}>
          ⚙️ Filter
        </button>
      </header>

      <div className="fd-main-split">
        
        {/* LEFT PANEL: Editor */}
        <aside className="fd-editor-panel">
          {selectedEntity ? (
            <div className="fd-editor">
              <div className="fd-editor-header">
                <h3>Edit {currentType.slice(0, -1)}</h3>
                <button className="fd-close-btn" onClick={() => setSelectedEntity(null)}>×</button>
              </div>
              
              <div className="fd-editor-form">
                {/* Dynamic form fields based on entity type */}
                {currentType === 'recipes' && (
                  <>
                    <label>Title</label>
                    <input 
                      type="text" 
                      value={(selectedEntity as Recipe).title || ''}
                      onChange={(e) => setSelectedEntity({...selectedEntity, title: e.target.value} as TableEntity)}
                      className="fd-input"
                    />
                    
                    <label>Notes</label>
                    <textarea 
                      value={(selectedEntity as Recipe).notes || ''}
                      onChange={(e) => setSelectedEntity({...selectedEntity, notes: e.target.value} as TableEntity)}
                      className="fd-textarea"
                      rows={4}
                    />
                    
                    <label>Ingredients</label>
                    <div className="fd-relation-field">
                      {/* TODO: Add ingredient selector component */}
                      <span className="fd-placeholder">+ Add ingredient</span>
                    </div>
                  </>
                )}
                
                {currentType === 'ingredients' && (
                  <>
                    <label>Name</label>
                    <input 
                      type="text" 
                      value={(selectedEntity as Ingredient).name || ''}
                      onChange={(e) => setSelectedEntity({...selectedEntity, name: e.target.value} as TableEntity)}
                      className="fd-input"
                    />
                    
                    <label>Notes</label>
                    <textarea 
                      value={(selectedEntity as Ingredient).notes || ''}
                      onChange={(e) => setSelectedEntity({...selectedEntity, notes: e.target.value} as TableEntity)}
                      className="fd-textarea"
                      rows={3}
                    />
                  </>
                )}
                
                {/* Add other entity forms similarly */}
              </div>
              
              <div className="fd-editor-actions">
                <button className="fd-btn-primary" onClick={handleSave}>💾 Save</button>
                <button className="fd-btn-secondary" onClick={() => setSelectedEntity(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="fd-editor-empty">
              <p>Select a row to edit</p>
              <p className="fd-hint">Click any row in the table → edit details here</p>
            </div>
          )}
        </aside>

        {/* RIGHT PANEL: Table View */}
        <main className="fd-table-panel">
          {isLoading ? (
            <div className="fd-loading">Loading...</div>
          ) : (
            <div className="fd-table-wrapper">
              <table className="fd-table">
                <thead>
                  <tr>
                    {COLUMNS[currentType].map(col => (
                      <th 
                        key={col.key}
                        onClick={col.sortable ? () => handleSort(col.key) : undefined}
                        className={col.sortable ? 'fd-sortable' : ''}
                      >
                        {col.label}
                        {sortConfig?.key === col.key && (
                          <span className="fd-sort-indicator">
                            {sortConfig.direction === 'asc' ? '▲' : '▼'}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEntities.length > 0 ? (
                    filteredEntities.map(entity => (
                      <tr 
                        key={entity.id}
                        onClick={() => handleEntitySelect(entity)}
                        className={selectedEntity?.id === entity.id ? 'fd-selected' : ''}
                      >
                        {COLUMNS[currentType].map(col => (
                          <td key={col.key}>
                            {col.key === 'ingredients' && Array.isArray((entity as Recipe).ingredients)
                              ? (entity as Recipe).ingredients?.map(i => i.name).join(', ')
                              : col.key === 'techniques' && Array.isArray((entity as Recipe).techniques)
                              ? (entity as Recipe).techniques?.join(', ')
                              : (entity as any)[col.key] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={COLUMNS[currentType].length} className="fd-empty-state">
                        No {currentType} found. Try adjusting your search or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}