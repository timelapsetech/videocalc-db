import React, { useState, useEffect } from 'react';
import { Star, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { useCodecContext } from '../context/CodecContext';
import { resolutions, frameRates } from '../data/resolutions';
import { CustomPreset } from '../context/PresetContext';
import firebaseService from '../services/firebaseService';

const PresetManager: React.FC = () => {
  const { categories } = useCodecContext();
  
  // Hardcoded fallback defaults
  const getHardcodedDefaults = (): CustomPreset[] => [
    {
      id: 'preset-1',
      name: 'YouTube 1080p',
      category: 'delivery',
      codec: 'h264',
      variant: 'High Profile',
      resolution: '1080p',
      frameRate: '30'
    },
    {
      id: 'preset-2',
      name: 'Netflix 4K',
      category: 'broadcast',
      codec: 'jpeg2000',
      variant: 'J2K IMF 4K',
      resolution: '4K',
      frameRate: '24'
    },
    {
      id: 'preset-3',
      name: 'News TV',
      category: 'camera',
      codec: 'xdcam',
      variant: 'XDCAM HD422',
      resolution: '1080i',
      frameRate: '29.97'
    },
    {
      id: 'preset-4',
      name: 'Episodic TV',
      category: 'professional',
      codec: 'dnxhd',
      variant: 'DNxHD 145',
      resolution: '1080p',
      frameRate: '23.98'
    }
  ];

  const [defaultPresets, setDefaultPresets] = useState<CustomPreset[]>(getHardcodedDefaults());
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: number]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load presets from Firebase on component mount
  useEffect(() => {
    const loadPresetsFromFirebase = async () => {
      try {
        setIsLoading(true);
        console.log('Loading default presets from Firebase for admin...');
        
        const firebasePresets = await firebaseService.getDefaultPresets();
        if (firebasePresets && firebasePresets.length > 0) {
          console.log('Loaded presets from Firebase:', firebasePresets);
          setDefaultPresets(firebasePresets);
        } else {
          console.log('No presets found in Firebase, using hardcoded defaults');
          setDefaultPresets(getHardcodedDefaults());
        }
      } catch (error) {
        console.error('Failed to load presets from Firebase:', error);
        // Try localStorage fallback
        const saved = localStorage.getItem('adminDefaultPresets');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            console.log('Loaded presets from localStorage fallback');
            setDefaultPresets(parsed);
          } catch {
            console.log('Failed to parse localStorage presets, using hardcoded defaults');
            setDefaultPresets(getHardcodedDefaults());
          }
        } else {
          console.log('Using hardcoded defaults');
          setDefaultPresets(getHardcodedDefaults());
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPresetsFromFirebase();
  }, []);

  // Validate a preset configuration
  const validatePreset = (preset: CustomPreset, index: number): string | null => {
    if (!preset.name.trim()) {
      return 'Preset name is required';
    }

    if (!preset.category) {
      return 'Category is required';
    }

    const category = categories.find(cat => cat.id === preset.category);
    if (!category) {
      return 'Invalid category selected';
    }

    if (!preset.codec) {
      return 'Codec is required';
    }

    const codec = category.codecs.find(c => c.id === preset.codec);
    if (!codec) {
      return 'Invalid codec selected';
    }

    if (!preset.variant) {
      return 'Variant is required';
    }

    const variant = codec.variants.find(v => v.name === preset.variant);
    if (!variant) {
      return 'Invalid variant selected';
    }

    if (!preset.resolution) {
      return 'Resolution is required';
    }

    const resolution = resolutions.find(r => r.id === preset.resolution);
    if (!resolution) {
      return 'Invalid resolution selected';
    }

    if (!preset.frameRate) {
      return 'Frame rate is required';
    }

    const frameRate = frameRates.find(fr => fr.id === preset.frameRate);
    if (!frameRate) {
      return 'Invalid frame rate selected';
    }

    // Check if the variant supports the selected resolution
    const resolutionBitrates = variant.bitrates[preset.resolution];
    if (!resolutionBitrates) {
      return `${variant.name} doesn't support ${resolution.name}`;
    }

    // If frame rate specific bitrates exist, check if the frame rate is supported
    if (typeof resolutionBitrates === 'object' && !resolutionBitrates[preset.frameRate]) {
      const availableFrameRates = Object.keys(resolutionBitrates);
      if (availableFrameRates.length > 0) {
        return `${variant.name} at ${resolution.name} doesn't support ${frameRate.name}. Available: ${availableFrameRates.join(', ')}`;
      }
    }

    return null;
  };

  // Validate all presets
  const validateAllPresets = () => {
    const errors: { [key: number]: string } = {};
    defaultPresets.forEach((preset, index) => {
      const error = validatePreset(preset, index);
      if (error) {
        errors[index] = error;
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Update a specific preset
  const updatePreset = (index: number, updates: Partial<CustomPreset>) => {
    const newPresets = [...defaultPresets];
    newPresets[index] = { ...newPresets[index], ...updates };
    
    // Reset dependent fields when parent changes
    if (updates.category && updates.category !== defaultPresets[index].category) {
      newPresets[index].codec = '';
      newPresets[index].variant = '';
    }
    if (updates.codec && updates.codec !== defaultPresets[index].codec) {
      newPresets[index].variant = '';
    }
    
    setDefaultPresets(newPresets);
    setHasChanges(true);
  };

  // Save presets to Firebase and update the global default
  const savePresets = async () => {
    if (!validateAllPresets()) {
      alert('Please fix all validation errors before saving.');
      return;
    }

    try {
      // Save to Firebase
      await firebaseService.saveAllDefaultPresets(defaultPresets);
      
      // Also save to localStorage as backup
      localStorage.setItem('adminDefaultPresets', JSON.stringify(defaultPresets));
      localStorage.setItem('defaultPresets', JSON.stringify(defaultPresets));
      
      setHasChanges(false);
      alert('Default presets saved successfully to Firebase!');
    } catch (error) {
      console.error('Failed to save presets to Firebase:', error);
      alert('Failed to save presets to Firebase. Please try again.');
    }
  };

  // Reset to hardcoded defaults
  const resetToDefaults = () => {
    if (confirm('Reset all presets to factory defaults? This cannot be undone.')) {
      const hardcodedDefaults = [
        {
          id: 'preset-1',
          name: 'YouTube 1080p',
          category: 'delivery',
          codec: 'h264',
          variant: 'High Profile',
          resolution: '1080p',
          frameRate: '30'
        },
        {
          id: 'preset-2',
          name: 'Netflix 4K',
          category: 'broadcast',
          codec: 'jpeg2000',
          variant: 'J2K IMF 4K',
          resolution: '4K',
          frameRate: '24'
        },
        {
          id: 'preset-3',
          name: 'News TV',
          category: 'camera',
          codec: 'xdcam',
          variant: 'XDCAM HD422',
          resolution: '1080i',
          frameRate: '29.97'
        },
        {
          id: 'preset-4',
          name: 'Episodic TV',
          category: 'professional',
          codec: 'dnxhd',
          variant: 'DNxHD 145',
          resolution: '1080p',
          frameRate: '23.98'
        }
      ];
      
      setDefaultPresets(hardcodedDefaults);
      setHasChanges(true);
      setValidationErrors({});
    }
  };

  // Validate on mount and when presets change
  useEffect(() => {
    validateAllPresets();
  }, [defaultPresets, categories]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-dark-secondary rounded-xl p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading default presets from Firebase...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-dark-secondary rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Star className="h-6 w-6 text-yellow-400 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-white">Default Quick Start Presets</h2>
              <p className="text-gray-400 text-sm mt-1">
                Configure the 4 default presets that appear for all users
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={resetToDefaults}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset to Defaults</span>
            </button>
            
            <button
              onClick={savePresets}
              disabled={!hasChanges || Object.keys(validationErrors).length > 0}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {hasChanges && (
          <div className="mb-6 p-4 bg-yellow-600/10 border border-yellow-600/20 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-yellow-400 font-medium">You have unsaved changes</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {defaultPresets.map((preset, index) => {
            const category = categories.find(cat => cat.id === preset.category);
            const availableCodecs = category?.codecs || [];
            const codec = availableCodecs.find(c => c.id === preset.codec);
            const availableVariants = codec?.variants || [];
            const hasError = validationErrors[index];

            return (
              <div
                key={preset.id}
                className={`p-6 rounded-lg border-2 ${
                  hasError 
                    ? 'border-red-500 bg-red-600/10' 
                    : 'border-gray-700 bg-dark-primary'
                }`}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Preset Name
                    </label>
                    <input
                      type="text"
                      value={preset.name}
                      onChange={(e) => updatePreset(index, { name: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-secondary border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter preset name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={preset.category}
                      onChange={(e) => updatePreset(index, { category: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-secondary border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select category...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Codec
                    </label>
                    <select
                      value={preset.codec}
                      onChange={(e) => updatePreset(index, { codec: e.target.value })}
                      disabled={!preset.category}
                      className="w-full px-3 py-2 bg-dark-secondary border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="">Select codec...</option>
                      {availableCodecs.map(codec => (
                        <option key={codec.id} value={codec.id}>{codec.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Variant
                    </label>
                    <select
                      value={preset.variant}
                      onChange={(e) => updatePreset(index, { variant: e.target.value })}
                      disabled={!preset.codec}
                      className="w-full px-3 py-2 bg-dark-secondary border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="">Select variant...</option>
                      {availableVariants.map(variant => (
                        <option key={variant.name} value={variant.name}>{variant.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Resolution
                      </label>
                      <select
                        value={preset.resolution}
                        onChange={(e) => updatePreset(index, { resolution: e.target.value })}
                        className="w-full px-3 py-2 bg-dark-secondary border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select resolution...</option>
                        {resolutions.map(res => (
                          <option key={res.id} value={res.id}>{res.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Frame Rate
                      </label>
                      <select
                        value={preset.frameRate}
                        onChange={(e) => updatePreset(index, { frameRate: e.target.value })}
                        className="w-full px-3 py-2 bg-dark-secondary border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select frame rate...</option>
                        {frameRates.map(fr => (
                          <option key={fr.id} value={fr.id}>{fr.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {hasError && (
                    <div className="p-3 bg-red-600/20 border border-red-600/30 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                        <span className="text-red-400 text-sm">{hasError}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-2">How Default Presets Work</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• These 4 presets appear for all users when they first visit the calculator</li>
            <li>• Signed-in users can customize their own presets, but these remain as fallbacks</li>
            <li>• Changes here affect all new users and users who reset their presets</li>
            <li>• Make sure all configurations are valid and commonly used workflows</li>
            <li>• <strong>Frame Rate Guide:</strong> 23.98 fps = Film on TV (episodic/broadcast), 24 fps = True Cinema</li>
            <li>• <strong>NTSC Formats:</strong> NTSC DV (720×480) for DV cameras, NTSC D1 (720×486) for D1 broadcast</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PresetManager;