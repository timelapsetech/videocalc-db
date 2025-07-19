import React, { useState, useEffect } from 'react';
import { Save, X, RefreshCw } from 'lucide-react';
import { CodecVariant } from '../context/CodecContext';

interface VariantEditorProps {
  variant: CodecVariant;
  onSave: (variant: CodecVariant) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isNew?: boolean;
}

const VariantEditor: React.FC<VariantEditorProps> = ({
  variant,
  onSave,
  onCancel,
  isLoading = false,
  isNew = false
}) => {
  const [editedVariant, setEditedVariant] = useState<CodecVariant>({
    name: variant.name || '',
    description: variant.description || '',
    bitrates: variant.bitrates || {}
  });

  const [bitrateInput, setBitrateInput] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Initialize bitrate input with JSON representation
    try {
      setBitrateInput(JSON.stringify(editedVariant.bitrates, null, 2));
    } catch {
      setBitrateInput('{}');
    }
  }, []);

  const validateVariant = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate name
    if (!editedVariant.name.trim()) {
      newErrors.name = 'Variant name is required';
    }

    // Validate bitrates JSON
    try {
      const parsedBitrates = JSON.parse(bitrateInput);
      if (typeof parsedBitrates !== 'object' || parsedBitrates === null) {
        newErrors.bitrates = 'Bitrates must be a valid JSON object';
      } else {
        // Validate bitrates structure
        for (const [resolution, rates] of Object.entries(parsedBitrates)) {
          if (typeof rates === 'number') {
            if (rates <= 0) {
              newErrors.bitrates = `Invalid bitrate for ${resolution}: must be positive`;
              break;
            }
          } else if (typeof rates === 'object' && rates !== null) {
            for (const [frameRate, bitrate] of Object.entries(rates)) {
              if (typeof bitrate !== 'number' || bitrate <= 0) {
                newErrors.bitrates = `Invalid bitrate for ${resolution}@${frameRate}: must be a positive number`;
                break;
              }
            }
          } else {
            newErrors.bitrates = `Invalid bitrate format for ${resolution}`;
            break;
          }
        }
      }
    } catch {
      newErrors.bitrates = 'Invalid JSON format for bitrates';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateVariant()) {
      return;
    }

    try {
      const parsedBitrates = JSON.parse(bitrateInput);
      const finalVariant: CodecVariant = {
        ...editedVariant,
        bitrates: parsedBitrates
      };
      onSave(finalVariant);
    } catch (error) {
      setErrors({ bitrates: 'Failed to parse bitrates JSON' });
    }
  };

  const handleBitrateInputChange = (value: string) => {
    setBitrateInput(value);
    // Clear bitrates error when user starts typing
    if (errors.bitrates) {
      setErrors({ ...errors, bitrates: '' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium">
          {isNew ? 'Add New Variant' : 'Edit Variant'}
        </h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded text-white text-sm transition-colors"
          >
            {isLoading ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Save className="h-3 w-3" />
            )}
            <span>Save</span>
          </button>
          
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 rounded text-white text-sm transition-colors"
          >
            <X className="h-3 w-3" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Variant Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Variant Name *
          </label>
          <input
            type="text"
            value={editedVariant.name}
            onChange={(e) => {
              setEditedVariant({ ...editedVariant, name: e.target.value });
              if (errors.name) {
                setErrors({ ...errors, name: '' });
              }
            }}
            className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Enter variant name"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-red-400 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Variant Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <input
            type="text"
            value={editedVariant.description || ''}
            onChange={(e) => setEditedVariant({ ...editedVariant, description: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter variant description (optional)"
            disabled={isLoading}
          />
        </div>

        {/* Bitrates JSON */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Bitrates Configuration *
          </label>
          <textarea
            value={bitrateInput}
            onChange={(e) => handleBitrateInputChange(e.target.value)}
            className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.bitrates ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder='{"1080p": {"30": 25, "60": 50}, "4K": {"24": 100}}'
            rows={6}
            disabled={isLoading}
          />
          {errors.bitrates && (
            <p className="text-red-400 text-xs mt-1">{errors.bitrates}</p>
          )}
          <p className="text-gray-400 text-xs mt-1">
            JSON format: {`{"resolution": {"frameRate": bitrate}} or {"resolution": bitrate}`}
          </p>
        </div>
      </div>

      {/* Example */}
      <div className="bg-gray-800/50 rounded-lg p-3">
        <h5 className="text-gray-300 text-sm font-medium mb-2">Example Bitrates:</h5>
        <pre className="text-xs text-gray-400 font-mono">
{`{
  "1080p": {
    "24": 25,
    "30": 30,
    "60": 50
  },
  "4K": {
    "24": 100,
    "30": 120
  }
}`}
        </pre>
      </div>
    </div>
  );
};

export default VariantEditor;