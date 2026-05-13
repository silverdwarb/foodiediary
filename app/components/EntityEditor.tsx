'use client';

import { useState, useEffect } from 'react';
import { EntityType, Recipe, Ingredient } from '@/lib/types';
import { handleCreateEntity, handleUpdateEntity } from '../actions';

interface EntityEditorProps {
  isOpen: boolean;
  type: EntityType;
  initialData: Recipe | Ingredient | null; // Adjust union type as needed
  onClose: () => void;
  onSaveSuccess: () => void; // Trigger refresh in parent
}

export default function EntityEditor({ 
  isOpen, type, initialData, onClose, onSaveSuccess 
}: EntityEditorProps) {
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens or data changes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || { /* default empty values */ });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (initialData?.id) {
        await handleUpdateEntity(type, initialData.id, formData);
      } else {
        await handleCreateEntity(type, formData);
      }
      onSaveSuccess(); // Tell parent to refresh data
      onClose();
    } catch (err) {
      console.error("Save failed", err); // Keep this log for now since you're debugging
      alert("Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? `Edit ${type}` : `New ${type}`}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dynamic Fields based on type */}
          <input 
            placeholder="Name/Title" 
            value={formData.title || formData.name || ''}
            onChange={(e) => setFormData({...formData, title: e.target.value, name: e.target.value})}
            className="w-full border p-2 rounded"
          />
          
          {/* Add other fields specific to your types here */}

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}