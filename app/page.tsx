'use client';

import { useState, useEffect } from 'react';
import { EntityType, Recipe, Ingredient } from '@/lib/types';
import { fetchEntities, handleDeleteEntity } from './actions';
import TopBar from './components/TopBar';
import EntityTable from './components/EntityTable';
import EntityEditor from './components/EntityEditor';

export default function Page() {
  // Global State
  const [selectedType, setSelectedType] = useState<EntityType>('recipes');
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEntity, setEditingEntity] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data Fetching
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchEntities(selectedType, searchQuery);
      setEntities(data);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedType, searchQuery]); // Re-fetch when filters change

  // Handlers
  const handleAddNew = () => {
    setEditingEntity(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (entity: any) => {
    setEditingEntity(entity);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if(confirm("Are you sure?")) {
      await handleDeleteEntity(selectedType, id);
      loadData(); // Refresh list
    }
  };

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <TopBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        onAddNew={handleAddNew}
      />

      {loading ? (
        <div>Loading...</div>
      ) : (
        <EntityTable 
          entities={entities}
          type={selectedType}
          onSelect={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      <EntityEditor 
        isOpen={isModalOpen}
        type={selectedType}
        initialData={editingEntity}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={loadData}
      />
    </main>
  );
}