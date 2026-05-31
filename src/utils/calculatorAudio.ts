import type { AudioConfigurationOption, AudioProfile } from '../types/codecs';
import type { FileSizeCalculatorConfig } from './fileSizeCalculation';

/**
 * Partner-branded audio configuration IDs kept in the catalog for the spec library
 * resolution. The calculator maps these to generic channel/bitrate options.
 */
export const PARTNER_AUDIO_CONFIGURATION_ALIASES: Record<string, string> = {
  'stereo-vimeo-320': 'stereo-320',
  'stereo-youtube-384': 'stereo-384',
  'stereo-prime-320': 'stereo-320',
  'stereo-tubi-192': 'stereo-192',
  'surround-5-1-youtube-512': 'surround-5-1-512',
  'surround-prime-aac-768': 'surround-5-1-768',
};

const HIDDEN_CALCULATOR_AUDIO_CONFIGS = new Set(Object.keys(PARTNER_AUDIO_CONFIGURATION_ALIASES));

export function isCalculatorSelectableAudioConfig(configId: string): boolean {
  return !HIDDEN_CALCULATOR_AUDIO_CONFIGS.has(configId);
}

export function normalizeAudioConfigurationId(configId: string): string {
  return PARTNER_AUDIO_CONFIGURATION_ALIASES[configId] ?? configId;
}

export function getSelectableAudioConfigurations(
  profile: AudioProfile | undefined
): AudioConfigurationOption[] {
  if (!profile) {
    return [];
  }

  return profile.configurations.filter(configuration =>
    isCalculatorSelectableAudioConfig(configuration.id)
  );
}

/** Technical summary for calculator dropdowns — no partner or platform names. */
export function formatCalculatorAudioProfileDescription(profile: AudioProfile): string {
  const parts = [profile.codec];

  if (profile.kind === 'pcm') {
    if (profile.sampleRateHz) {
      parts.push(`${profile.sampleRateHz / 1000} kHz`);
    }
    if (profile.bitDepth) {
      parts.push(`${profile.bitDepth}-bit PCM`);
    }
  } else {
    parts.push('compressed');
  }

  return parts.join(' · ');
}

export function normalizeCalculatorAudio(
  config: FileSizeCalculatorConfig
): FileSizeCalculatorConfig {
  if (!config.audioConfigurationId) {
    return config;
  }

  return {
    ...config,
    audioConfigurationId: normalizeAudioConfigurationId(config.audioConfigurationId),
  };
}
