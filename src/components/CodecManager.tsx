import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Folder, Video } from 'lucide-react';
import { useCodecContext, CodecCategory, Codec, CodecVariant } from '../context/CodecContext';

const CodecManager: React.FC = () => {
  const { categories, updateCategories } = useCodecContext();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCodec, setEditingCodec] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory: CodecCategory = {
      id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
      name: newCategoryName,
      description: newCategoryDescription,
      codecs: []
    };
    
    updateCategories([...categories, newCategory]);
    setNewCategoryName('');
    setNewCategoryDescription('');
  };

  const deleteCategory = (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category and all its codecs?')) {
      updateCategories(categories.filter(cat => cat.id !== categoryId));
    }
  };

  const updateCategory = (categoryId: string, updates: Partial<CodecCategory>) => {
    const updatedCategories = categories.map(cat =>
      cat.id === categoryId ? { ...cat, ...updates } : cat
    );
    updateCategories(updatedCategories);
    setEditingCategory(null);
  };

  const addCodec = (categoryId: string) => {
    const codecName = prompt('Enter codec name:');
    if (!codecName) return;

    const newCodec: Codec = {
      id: codecName.toLowerCase().replace(/\s+/g, '-'),
      name: codecName,
      variants: [],
      description: '',
      workflowNotes: ''
    };

    const updatedCategories = categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, codecs: [...cat.codecs, newCodec] }
        : cat
    );
    updateCategories(updatedCategories);
  };

  const deleteCodec = (categoryId: string, codecId: string) => {
    if (confirm('Are you sure you want to delete this codec?')) {
      const updatedCategories = categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, codecs: cat.codecs.filter(codec => codec.id !== codecId) }
          : cat
      );
      updateCategories(updatedCategories);
    }
  };

  const updateCodec = (categoryId: string, codecId: string, updates: Partial<Codec>) => {
    const updatedCategories = categories.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            codecs: cat.codecs.map(codec =>
              codec.id === codecId ? { ...codec, ...updates } : codec
            )
          }
        : cat
    );
    updateCategories(updatedCategories);
    setEditingCodec(null);
  };

  return (
    <div className="space-y-6">
      {/* Add New Category */}
      <div className="bg-dark-secondary rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Plus className="h-5 w-5 mr-2 text-green-400" />
          Add New Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="px-4 py-2 bg-dark-primary border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newCategoryDescription}
            onChange={(e) => setNewCategoryDescription(e.target.value)}
            className="px-4 py-2 bg-dark-primary border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={addCategory}
          disabled={!newCategoryName.trim()}
          className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
        >
          Add Category
        </button>
      </div>

      {/* Category List */}
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-dark-secondary rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              {editingCategory === category.id ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mr-4">
                  <input
                    type="text"
                    defaultValue={category.name}
                    onBlur={(e) => updateCategory(category.id, { name: e.target.value })}
                    className="px-3 py-2 bg-dark-primary border border-gray-700 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    defaultValue={category.description || ''}
                    onBlur={(e) => updateCategory(category.id, { description: e.target.value })}
                    placeholder="Description"
                    className="px-3 py-2 bg-dark-primary border border-gray-700 rounded-lg text-white placeholder-gray-400"
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Folder className="h-6 w-6 text-blue-400" />
                  <div>
                    <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                    {category.description && (
                      <p className="text-gray-400 text-sm">{category.description}</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                {editingCategory === category.id ? (
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="p-2 text-green-400 hover:text-green-300"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingCategory(category.id)}
                    className="p-2 text-gray-400 hover:text-white"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => addCodec(category.id)}
                  className="p-2 text-green-400 hover:text-green-300"
                  title="Add Codec"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="p-2 text-red-400 hover:text-red-300"
                  title="Delete Category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Codecs */}
            <div className="space-y-3">
              {category.codecs.map((codec) => (
                <div key={codec.id} className="bg-dark-primary rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    {editingCodec === `${category.id}-${codec.id}` ? (
                      <div className="flex-1 space-y-2 mr-4">
                        <input
                          type="text"
                          defaultValue={codec.name}
                          onBlur={(e) => updateCodec(category.id, codec.id, { name: e.target.value })}
                          className="w-full px-3 py-2 bg-dark-secondary border border-gray-700 rounded text-white"
                        />
                        <input
                          type="text"
                          defaultValue={codec.description || ''}
                          onBlur={(e) => updateCodec(category.id, codec.id, { description: e.target.value })}
                          placeholder="Description"
                          className="w-full px-3 py-2 bg-dark-secondary border border-gray-700 rounded text-white placeholder-gray-400"
                        />
                        <textarea
                          defaultValue={codec.workflowNotes || ''}
                          onBlur={(e) => updateCodec(category.id, codec.id, { workflowNotes: e.target.value })}
                          placeholder="Workflow Notes"
                          rows={2}
                          className="w-full px-3 py-2 bg-dark-secondary border border-gray-700 rounded text-white placeholder-gray-400"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Video className="h-5 w-5 text-green-400" />
                        <div>
                          <div className="font-medium text-white">{codec.name}</div>
                          {codec.description && (
                            <div className="text-sm text-gray-400">{codec.description}</div>
                          )}
                          <div className="text-xs text-gray-500">
                            {codec.variants.length} variant{codec.variants.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      {editingCodec === `${category.id}-${codec.id}` ? (
                        <button
                          onClick={() => setEditingCodec(null)}
                          className="p-1 text-green-400 hover:text-green-300"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingCodec(`${category.id}-${codec.id}`)}
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteCodec(category.id, codec.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {category.codecs.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No codecs in this category
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodecManager;