import type { CodecCategory } from '../types/codecs';
import type { FileSizeCalculatorConfig } from './fileSizeCalculation';
import { getAudioProfiles, getDefaultAudioSelection } from './audioConfigurations';
import { normalizeCalculatorConfig } from './calculatorVariants';

export interface ResolvedCalculatorSelection {
  category: string;
  codec: string;
  variant: string;
  resolution: string;
  frameRate: string;
  videoBitrateOverrideMbps?: number;
  audioSelection: {
    enabled: boolean;
    profileId: string;
    configurationId: string;
  };
}

/** Normalize a calculator config and resolve audio IDs against the codec catalog. */
export function resolveCalculatorSelection(
  categories: CodecCategory[],
  input: FileSizeCalculatorConfig
): ResolvedCalculatorSelection | null {
  const normalized = normalizeCalculatorConfig(input, categories);
  const categoryData = categories.find(category => category.id === normalized.category);
  const codecData = categoryData?.codecs.find(codec => codec.id === normalized.codec);
  const variantData = codecData?.variants.find(variant => variant.name === normalized.variant);

  if (!categoryData || !codecData || !variantData) {
    return null;
  }

  const audioProfiles = getAudioProfiles(codecData, variantData);
  const defaultAudio = getDefaultAudioSelection(codecData, variantData);
  const audioProfile = audioProfiles.find(profile => profile.id === normalized.audioProfileId);
  const audioConfiguration = audioProfile?.configurations.find(
    configuration => configuration.id === normalized.audioConfigurationId
  );
  const wantsAudio = normalized.audioEnabled ?? input.audioEnabled ?? false;

  return {
    category: normalized.category,
    codec: normalized.codec,
    variant: normalized.variant,
    resolution: normalized.resolution,
    frameRate: normalized.frameRate,
    videoBitrateOverrideMbps: normalized.videoBitrateOverrideMbps,
    audioSelection: {
      enabled: wantsAudio && audioProfiles.length > 0,
      profileId: audioProfile?.id ?? defaultAudio.profileId,
      configurationId: audioConfiguration?.id ?? defaultAudio.configurationId,
    },
  };
}
