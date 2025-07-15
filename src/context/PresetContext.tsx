import React, { createContext, useContext, useState, useEffect } from 'react';

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
}

// Function to get admin-configured defaults or fallback to hardcoded
const getAdminDefaults = (): CustomPreset[] => {
  // First check for admin-configured defaults
  const adminDefaults = localStorage.getItem('adminDefaultPresets');
  if (adminDefaults) {
    try {
      const parsed = JSON.parse(adminDefaults);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Fall through to hardcoded defaults
    }
  }

  // Check for the general default presets (set by admin)
  const defaultPresets = localStorage.getItem('defaultPresets');
  if (defaultPresets) {
    try {
      const parsed = JSON.parse(defaultPresets);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Fall through to hardcoded defaults
    }
  }

  // Updated hardcoded fallback defaults with proper frame rates
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

  // Listen for changes to admin defaults and reload if needed
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminDefaultPresets' || e.key === 'defaultPresets') {
        // If user doesn't have custom presets, update to new admin defaults
        if (!localStorage.getItem('customPresets')) {
          setCustomPresets(getAdminDefaults());
        }
      }
    };

    // Also listen for direct localStorage changes (same tab)
    const handleLocalStorageUpdate = () => {
      if (!localStorage.getItem('customPresets')) {
        setCustomPresets(getAdminDefaults());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Check for updates every few seconds
    const interval = setInterval(handleLocalStorageUpdate, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const loadPresets = () => {
    // Load from local storage only (no cloud sync)
    const localPresets = localStorage.getItem('customPresets');
    if (localPresets) {
      try {
        setCustomPresets(JSON.parse(localPresets));
      } catch {
        setCustomPresets(getAdminDefaults());
      }
    } else {
      // No custom presets, use admin defaults
      setCustomPresets(getAdminDefaults());
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

  const resetToDefaults = () => {
    const defaults = getAdminDefaults();
    savePresets(defaults);
  };

  return (
    <PresetContext.Provider value={{ 
      customPresets, 
      updatePreset, 
      addPreset, 
      deletePreset, 
      resetToDefaults, 
      syncStatus 
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