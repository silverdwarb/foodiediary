'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  fetchEntities, 
  fetchEntityById,
  handleCreateEntity, 
  handleUpdateEntity,
  handleDeleteEntity 
} from './actions';
import { EntityType, TableEntity, Recipe, Ingredient, Technique, Equipment, Flavor, CookLog } from '@/lib/types';
import './globals.css';

// Column definitions (unchanged)
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
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // ✅ Fetch entities from Server Action
  const loadEntities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchEntities(currentType, {
        search: searchQuery || undefined,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        sort: sortConfig || undefined,
      });
      setEntities(data);
    } catch (err) {
      console.error('Failed to load entities:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentType, searchQuery, filters, sortConfig]);

  // ✅ Load entities when dependencies change
  useEffect(() => {
    loadEntities();
  }, [loadEntities]);

  // ✅ Load full entity details when a row is selected
  const handleEntitySelect = async (entity: TableEntity) => {
    try {
      const fullEntity = await fetchEntityById(currentType, entity.id);
      setSelectedEntity(fullEntity);
    } catch (err) {
      console.error('Failed to load entity details:', err);
      // Fallback to partial data
      setSelectedEntity(entity);
    }
  };

  // ✅ Handle Save (Create or Update)
  const handleSave = async () => {
    if (!selectedEntity) return;
    
    setIsLoading(true);
    try {
      if (selectedEntity.id) {
        // Update existing
        await handleUpdateEntity(currentType, selectedEntity.id, selectedEntity);
      } else {
        // Create new
        const result = await handleCreateEntity(currentType, selectedEntity);
        if (result.success && result.data?.id) {
          setSelectedEntity({ ...selectedEntity, id: result.data.id });
        }
      }
      // Refresh list and close editor
      await loadEntities();
      setSelectedEntity(null);
    } catch (err: any) {
      console.error('Save failed:', err);
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle Delete
  const handleDelete = async () => {
    if (!selectedEntity?.id) return;
    if (!confirm(`Delete this ${currentType.slice(0, -1)}?`)) return;
    
    try {
      await handleDeleteEntity(currentType, selectedEntity.id);
      await loadEntities();
      setSelectedEntity(null);
    } catch (err: any) {
      console.error('Delete failed:', err);
      setError(err.message || 'Failed to delete.');
    }
  };

  // ✅ Handle New Entity
  const handleNew = () => {
    // Create empty entity based on type
    const emptyEntity: Partial<TableEntity> = {
      id: undefined, // No ID = new entity
      ...(currentType === 'recipes' && { title: '', notes: '' }),
      ...(currentType === 'ingredients' && { name: '', notes: '' }),
      ...(currentType === 'techniques' && { tech_name: '', notes: '' }),
      ...(currentType === 'equipment' && { title: '', notes: '', care: {} }),
      ...(currentType === 'flavors' && { name: '' }),
      ...(currentType === 'cook_logs' && { recipe_id: undefined, rating: undefined }),
    };
    setSelectedEntity(emptyEntity as TableEntity);
    setIsCreating(true);
  };

  // ✅ Client-side filter/sort (optional; server-side is better for large datasets)
  const filteredEntities = useMemo(() => {
    let result = [...entities];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(entity => 
        Object.values(entity).some(val => 
          String(val).toLowerCase().includes(query)
        )
      );
    }
    
    if (filters.rating) {
      result = result.filter(e => (e as any).rating >= filters.rating);
    }
    
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

  return (
    <div className="fd-container">
      
      {/* Top Bar */}
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
              setSearchQuery('');
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
        
        <div className="fd-actions">
          <button className="fd-btn-secondary" onClick={handleNew}>+ New</button>
          <button className="fd-filter-btn" onClick={() => {}}>⚙️ Filter</button>
        </div>
      </header>

      {/* Error Toast */}
      {error && (
        <div className="fd-error-toast" onClick={() => setError(null)}>
          ⚠️ {error}
        </div>
      )}

      <div className="fd-main-split">
        
        {/* LEFT PANEL: Editor */}
        <aside className="fd-editor-panel">
          {selectedEntity ? (
            <div className="fd-editor">
              <div className="fd-editor-header">
                <h3>{isCreating ? 'New' : 'Edit'} {currentType.slice(0, -1)}</h3>
                <button className="fd-close-btn" onClick={() => setSelectedEntity(null)}>×</button>
              </div>
              
              <div className="fd-editor-form">
                {/* Dynamic form fields */}
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
                      <span className="fd-placeholder">+ Add ingredient (coming soon)</span>
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
                
                {/* Add forms for other types similarly */}
              </div>
              
              <div className="fd-editor-actions">
                <button 
                  className="fd-btn-primary" 
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : '💾 Save'}
                </button>
                {selectedEntity.id && (
                  <button 
                    className="fd-btn-danger" 
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    🗑️ Delete
                  </button>
                )}
                <button 
                  className="fd-btn-secondary" 
                  onClick={() => setSelectedEntity(null)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="fd-editor-empty">
              <p>Select a row to edit</p>
              <p className="fd-hint">Or click "+ New" to create one</p>
            </div>
          )}
        </aside>

        {/* RIGHT PANEL: Table View */}
        <main className="fd-table-panel">
          {isLoading && entities.length === 0 ? (
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
                              ? (entity as Recipe).ingredients?.map((i: any) => i.name).join(', ')
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
                        {searchQuery || Object.keys(filters).length > 0 
                          ? 'No results. Try adjusting filters.' 
                          : `No ${currentType} found. Click "+ New" to add one.`}
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