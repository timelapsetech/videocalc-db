import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBundledDefaultPresets } from '../data/loadDefaultPresets';
import type { CustomPreset } from '../types/presets';

export type { CustomPreset } from '../types/presets';

interface PresetContextType {
  customPresets: CustomPreset[];
  updatePreset: (index: number, preset: CustomPreset) => void;
  addPreset: (preset: CustomPreset) => void;
  deletePreset: (index: number) => void;
  resetToDefaults: () => void;
}

const PresetContext = createContext<PresetContextType | undefined>(undefined);

export const PresetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = () => {
    const localPresets = localStorage.getItem('customPresets');
    if (localPresets) {
      try {
        const parsed = JSON.parse(localPresets) as CustomPreset[];
        console.log('Loaded user custom presets');
        setCustomPresets(parsed);
        return;
      } catch {
        console.log('Failed to parse custom presets, loading defaults');
      }
    }

    try {
      setCustomPresets(getBundledDefaultPresets());
    } catch (error) {
      console.error('Failed to load default presets:', error);
      setCustomPresets([]);
    }
  };

  const savePresets = (presets: CustomPreset[]) => {
    setCustomPresets(presets);
    localStorage.setItem('customPresets', JSON.stringify(presets));
  };

  const updatePreset = (index: number, preset: CustomPreset) => {
    const newPresets = [...customPresets];
    newPresets[index] = preset;
    savePresets(newPresets);
  };

  const addPreset = (preset: CustomPreset) => {
    savePresets([...customPresets, preset]);
  };

  const deletePreset = (index: number) => {
    savePresets(customPresets.filter((_, i) => i !== index));
  };

  const resetToDefaults = () => {
    try {
      const defaults = getBundledDefaultPresets();
      localStorage.removeItem('customPresets');
      savePresets(defaults.length > 0 ? defaults : []);
    } catch (error) {
      console.error('Failed to reset to defaults:', error);
    }
  };

  return (
    <PresetContext.Provider
      value={{
        customPresets,
        updatePreset,
        addPreset,
        deletePreset,
        resetToDefaults,
      }}
    >
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
