import React, { createContext, useContext, useState, useEffect } from 'react';
import firebaseService from '../services/firebaseService';

export interface CustomPreset {
  id: string;
  name: string;
  category: string;
  codec: string;
  variant: string;
  resolution: string;
  frameRate: string;
}

interface PresetContextType {
  customPresets: CustomPreset[];
  updatePreset: (index: number, preset: CustomPreset) => void;
  addPreset: (preset: CustomPreset) => void;
  deletePreset: (index: number) => void;
  resetToDefaults: () => void;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  refreshDefaultPresets: () => Promise<void>;
}

// Function to get default presets with Firebase → localStorage → hardcoded fallback
const getDefaultPresets = async (): Promise<CustomPreset[]> => {
  try {
    // First try to load from Firebase
    console.log('Loading default presets from Firebase...');
    const firebasePresets = await firebaseService.getDefaultPresets();
    if (firebasePresets && firebasePresets.length > 0) {
      console.log('Loaded default presets from Firebase:', firebasePresets);
      // Cache in localStorage for offline access
      localStorage.setItem('firebaseDefaultPresets', JSON.stringify(firebasePresets));
      return firebasePresets;
    }
  } catch (error) {
    console.log('Failed to load from Firebase, trying localStorage cache:', error);
  }

  // Fallback to localStorage cache
  const cachedPresets = localStorage.getItem('firebaseDefaultPresets');
  if (cachedPresets) {
    try {
      const parsed = JSON.parse(cachedPresets);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('Loaded default presets from localStorage cache');
        return parsed;
      }
    } catch {
      console.log('Failed to parse cached presets');
    }
  }

  // Check for legacy admin-configured defaults
  const adminDefaults = localStorage.getItem('adminDefaultPresets');
  if (adminDefaults) {
    try {
      const parsed = JSON.parse(adminDefaults);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('Loaded default presets from legacy admin defaults');
        return parsed;
      }
    } catch {
      // Fall through to hardcoded defaults
    }
  }

  // Final fallback to hardcoded defaults
  console.log('Using hardcoded default presets');
  return [
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
};

const PresetContext = createContext<PresetContextType | undefined>(undefined);

export const PresetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
  const [syncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // Load presets when component mounts
  useEffect(() => {
    loadPresets();
  }, []);

  // Listen for Firebase preset changes and reload if needed
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    // Set up Firebase listener for default presets
    try {
      unsubscribe = firebaseService.subscribeToDefaultPresets(async (firebasePresets) => {
        // Only update if user doesn't have custom presets
        if (!localStorage.getItem('customPresets')) {
          console.log('Firebase default presets updated, refreshing...');
          setCustomPresets(firebasePresets);
          // Update cache
          localStorage.setItem('firebaseDefaultPresets', JSON.stringify(firebasePresets));
        }
      });
    } catch (error) {
      console.log('Failed to set up Firebase listener:', error);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const loadPresets = async () => {
    // Check if user has custom presets first
    const localPresets = localStorage.getItem('customPresets');
    if (localPresets) {
      try {
        const parsed = JSON.parse(localPresets);
        console.log('Loaded user custom presets');
        setCustomPresets(parsed);
        return;
      } catch {
        console.log('Failed to parse custom presets, loading defaults');
      }
    }

    // No custom presets, load defaults from Firebase
    try {
      const defaults = await getDefaultPresets();
      setCustomPresets(defaults);
    } catch (error) {
      console.error('Failed to load default presets:', error);
      // Use hardcoded fallback
      setCustomPresets([
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
      ]);
    }
  };

  const savePresets = (presets: CustomPreset[]) => {
    setCustomPresets(presets);
    // Save locally only (no cloud sync)
    localStorage.setItem('customPresets', JSON.stringify(presets));
  };

  const updatePreset = (index: number, preset: CustomPreset) => {
    const newPresets = [...customPresets];
    newPresets[index] = preset;
    savePresets(newPresets);
  };

  const addPreset = (preset: CustomPreset) => {
    const newPresets = [...customPresets, preset];
    savePresets(newPresets);
  };

  const deletePreset = (index: number) => {
    const newPresets = customPresets.filter((_, i) => i !== index);
    savePresets(newPresets);
  };

  const resetToDefaults = async () => {
    try {
      const defaults = await getDefaultPresets();
      // Clear custom presets to force reload from Firebase
      localStorage.removeItem('customPresets');
      savePresets(defaults);
    } catch (error) {
      console.error('Failed to reset to defaults:', error);
    }
  };

  const refreshDefaultPresets = async () => {
    try {
      const defaults = await getDefaultPresets();
      // Only update if user doesn't have custom presets
      if (!localStorage.getItem('customPresets')) {
        setCustomPresets(defaults);
      }
    } catch (error) {
      console.error('Failed to refresh default presets:', error);
    }
  };

  return (
    <PresetContext.Provider value={{ 
      customPresets, 
      updatePreset, 
      addPreset, 
      deletePreset, 
      resetToDefaults, 
      syncStatus,
      refreshDefaultPresets
    }}>
      {children}
    </PresetContext.Provider>
  );
};

export const usePresetContext = () => {
  const context = useContext(PresetContext);
  if (!context) {
    throw new Error('usePresetContext must be used within PresetContext');
  }
  return context;
};