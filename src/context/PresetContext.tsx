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

const NETFLIX_PRESET_ID = '9XoYztCoVCCAwCIDsrnO';

const YOUTUBE_PRESET_ID = '1ixtcVkfQSPxMJyqreZs';

const netflixImfPreset: CustomPreset = {
  id: NETFLIX_PRESET_ID,
  name: 'Netflix IMF 4K',
  category: 'broadcast',
  codec: 'jpeg2000',
  variant: 'J2K IMF 4K',
  resolution: 'UHD',
  frameRate: '24',
  audioEnabled: true,
  audioProfileId: 'dcp-imf-pcm-48k-24bit',
  audioConfigurationId: 'surround-5-1',
};

const youtube1080Preset: CustomPreset = {
  id: YOUTUBE_PRESET_ID,
  name: 'YouTube 1080p',
  category: 'delivery',
  codec: 'h264',
  variant: 'High Profile',
  resolution: '1080p',
  frameRate: '30',
  audioEnabled: true,
  audioProfileId: 'mp4-aac',
  audioConfigurationId: 'stereo-384',
  videoBitrateOverrideMbps: 8,
};

const migrateBundledPreset = (preset: CustomPreset): CustomPreset => {
  const isBundledNetflixPreset =
    preset.id === NETFLIX_PRESET_ID ||
    (
      preset.name === 'Netflix 4K' &&
      preset.category === 'broadcast' &&
      preset.codec === 'jpeg2000' &&
      preset.variant === 'J2K IMF 4K'
    );

  if (isBundledNetflixPreset) {
    return netflixImfPreset;
  }

  const isBundledYouTubePreset =
    preset.id === YOUTUBE_PRESET_ID ||
    (preset.name === 'YouTube 1080p' && preset.category === 'delivery' && preset.codec === 'h264');

  if (isBundledYouTubePreset) {
    return youtube1080Preset;
  }

  return preset;
};

export const PresetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = () => {
    const localPresets = localStorage.getItem('customPresets');
    if (localPresets) {
      try {
        const parsed = (JSON.parse(localPresets) as CustomPreset[]).map(migrateBundledPreset);
        console.log('Loaded user custom presets');
        setCustomPresets(parsed);
        localStorage.setItem('customPresets', JSON.stringify(parsed));
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
