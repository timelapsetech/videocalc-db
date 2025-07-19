import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Zap, Settings, Trash2 } from 'lucide-react';
import { useCodecContext } from '../context/CodecContext';
import { resolutions, frameRates } from '../data/resolutions';
import { CustomPreset } from '../context/PresetContext';

interface EditablePresetCardProps {
  preset: CustomPreset;
  isActive: boolean;
  onApply: () => void;
  onUpdate: (preset: CustomPreset) => void;
  canDelete?: boolean;
  onDelete?: () => void;
}

const EditablePresetCard: React.FC<EditablePresetCardProps> = ({
  preset,
  isActive,
  onApply,
  onUpdate,
  canDelete = false,
  onDelete
}) => {
  const { categories } = useCodecContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editingPreset, setEditingPreset] = useState<CustomPreset>(preset);

  // Update editingPreset when preset prop changes or when starting to edit
  useEffect(() => {
    setEditingPreset(preset);
  }, [preset]);

  // Reset editing state when starting to edit
  const handleStartEditing = () => {
    setEditingPreset({ ...preset }); // Create a fresh copy of the current preset
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(editingPreset);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditingPreset({ ...preset }); // Reset to original preset values
    setIsEditing(false);
  };

  // Get available options for editing
  const availableCodecs = editingPreset.category 
    ? categories.find(cat => cat.id === editingPreset.category)?.codecs || []
    : [];

  const availableVariants = editingPreset.codec
    ? availableCodecs.find(codec => codec.id === editingPreset.codec)?.variants || []
    : [];

  // Reset dependent selections when parent changes
  const handleCategoryChange = (categoryId: string) => {
    setEditingPreset({
      ...editingPreset,
      category: categoryId,
      codec: '',
      variant: ''
    });
  };

  const handleCodecChange = (codecId: string) => {
    setEditingPreset({
      ...editingPreset,
      codec: codecId,
      variant: ''
    });
  };

  if (isEditing) {
    return (
      <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-600/10 shadow-lg">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Preset Name</label>
            <input
              type="text"
              value={editingPreset.name}
              onChange={(e) => setEditingPreset({ ...editingPreset, name: e.target.value })}
              className="w-full px-3 py-2 bg-dark-primary border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter preset name"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Category</label>
            <select
              value={editingPreset.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 bg-dark-primary border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Codec</label>
            <select
              value={editingPreset.codec}
              onChange={(e) => handleCodecChange(e.target.value)}
              disabled={!editingPreset.category}
              className="w-full px-3 py-2 bg-dark-primary border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Select codec...</option>
              {availableCodecs.map(codec => (
                <option key={codec.id} value={codec.id}>{codec.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Variant</label>
            <select
              value={editingPreset.variant}
              onChange={(e) => setEditingPreset({ ...editingPreset, variant: e.target.value })}
              disabled={!editingPreset.codec}
              className="w-full px-3 py-2 bg-dark-primary border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Select variant...</option>
              {availableVariants.map(variant => (
                <option key={variant.name} value={variant.name}>{variant.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Resolution</label>
              <select
                value={editingPreset.resolution}
                onChange={(e) => setEditingPreset({ ...editingPreset, resolution: e.target.value })}
                className="w-full px-3 py-2 bg-dark-primary border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {resolutions.map(res => (
                  <option key={res.id} value={res.id}>{res.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Frame Rate</label>
              <select
                value={editingPreset.frameRate}
                onChange={(e) => setEditingPreset({ ...editingPreset, frameRate: e.target.value })}
                className="w-full px-3 py-2 bg-dark-primary border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {frameRates.map(fr => (
                  <option key={fr.id} value={fr.id}>{fr.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div>
              {canDelete && onDelete && (
                <button
                  onClick={() => {
                    if (confirm('Delete this preset?')) {
                      onDelete();
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-xs bg-gray-600 hover:bg-gray-700 rounded text-white transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
              <button
                onClick={handleSave}
                disabled={!editingPreset.name || !editingPreset.category || !editingPreset.codec || !editingPreset.variant}
                className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white transition-colors"
              >
                <Save className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onApply}
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-200 text-left group hover-lift w-full
        ${isActive 
          ? 'border-blue-500 bg-blue-600/20 shadow-lg' 
          : 'border-gray-700 bg-dark-secondary hover:border-blue-400 hover:bg-blue-600/10'
        }
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-semibold text-sm ${isActive ? 'text-blue-300' : 'text-white group-hover:text-blue-300'}`}>
          {preset.name}
        </h3>
        <div className="flex items-center space-x-1">
          {isActive && <Zap className="h-4 w-4 text-blue-400" />}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleStartEditing();
            }}
            className="p-1 rounded hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Edit preset"
          >
            <Edit2 className="h-3 w-3 text-gray-400 hover:text-white" />
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-400 space-y-1">
        <div>Resolution: {preset.resolution}</div>
        <div>Codec: {preset.variant}</div>
      </div>
    </button>
  );
};

export default EditablePresetCard;