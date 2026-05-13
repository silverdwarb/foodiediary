'use client';
import { EntityType, TableEntity, Recipe } from '@/lib/types';

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

interface EntityTableProps {
  entities: TableEntity[];
  filteredEntities: TableEntity[];
  currentType: EntityType;
  selectedEntity: TableEntity | null;
  isLoading: boolean;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  searchQuery: string;
  filters: Record<string, any>;
  onSort: (key: string) => void;
  onSelect: (entity: TableEntity) => void;
}

export default function EntityTable({
  entities,
  filteredEntities,
  currentType,
  selectedEntity,
  isLoading,
  sortConfig,
  searchQuery,
  filters,
  onSort,
  onSelect,
}: EntityTableProps) {
  if (isLoading && entities.length === 0) {
    return <div className="fd-loading">Loading...</div>;
  }

  return (
    <div className="fd-table-wrapper">
      <table className="fd-table">
        <thead>
          <tr>
            {COLUMNS[currentType].map(col => (
              <th 
                key={col.key}
                onClick={col.sortable ? () => onSort(col.key) : undefined}
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
                onClick={() => onSelect(entity)}
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
  );
}