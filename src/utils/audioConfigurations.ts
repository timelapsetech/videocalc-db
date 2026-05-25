import type { AudioConfigurationOption, AudioProfile, Codec, CodecVariant } from '../types/codecs';

export interface AudioSelection {
  enabled: boolean;
  profileId: string;
  configurationId: string;
}

export interface ResolvedAudioConfiguration {
  profile: AudioProfile;
  configuration: AudioConfigurationOption;
  bitrateMbps: number;
}

export function getAudioProfiles(codec?: Codec, variant?: CodecVariant): AudioProfile[] {
  if (variant?.audioProfiles?.length) {
    return variant.audioProfiles;
  }

  return codec?.audioProfiles ?? [];
}

export function getDefaultAudioSelection(codec?: Codec, variant?: CodecVariant): AudioSelection {
  const profiles = getAudioProfiles(codec, variant);
  const defaultProfileId = variant?.defaultAudioProfileId ?? codec?.defaultAudioProfileId ?? profiles[0]?.id ?? '';
  const profile = profiles.find(item => item.id === defaultProfileId) ?? profiles[0];
  const defaultConfigurationId = profile?.defaultConfigurationId ?? profile?.configurations[0]?.id ?? '';

  return {
    enabled: false,
    profileId: profile?.id ?? '',
    configurationId: defaultConfigurationId,
  };
}

export function resolveAudioConfiguration(
  profiles: AudioProfile[],
  selection: AudioSelection
): ResolvedAudioConfiguration | null {
  if (!selection.enabled || !selection.profileId || !selection.configurationId) {
    return null;
  }

  const profile = profiles.find(item => item.id === selection.profileId);
  const configuration = profile?.configurations.find(item => item.id === selection.configurationId);

  if (!profile || !configuration) {
    return null;
  }

  return {
    profile,
    configuration,
    bitrateMbps: calculateAudioBitrateMbps(profile, configuration),
  };
}

export function calculateAudioBitrateMbps(
  profile: AudioProfile,
  configuration: AudioConfigurationOption
): number {
  switch (profile.kind) {
    case 'pcm': {
      const sampleRateHz = configuration.sampleRateHz ?? profile.sampleRateHz;
      const bitDepth = configuration.bitDepth ?? profile.bitDepth;

      if (!sampleRateHz || !bitDepth) {
        return 0;
      }

      return (sampleRateHz * bitDepth * configuration.channels) / 1_000_000;
    }
    case 'compressed': {
      const bitrateKbps = configuration.bitrateKbps ?? profile.bitrateKbps;
      return bitrateKbps ? bitrateKbps / 1000 : 0;
    }
    default: {
      const exhaustiveKind: never = profile.kind;
      return exhaustiveKind;
    }
  }
}

export function formatAudioRate(profile: AudioProfile, configuration: AudioConfigurationOption): string {
  const bitrateMbps = calculateAudioBitrateMbps(profile, configuration);

  if (bitrateMbps < 1) {
    return `${Math.round(bitrateMbps * 1000)} kbps`;
  }

  return `${bitrateMbps.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')} Mbps`;
}

export function formatSampleRate(sampleRateHz?: number): string {
  if (!sampleRateHz) {
    return '';
  }

  return `${sampleRateHz / 1000} kHz`;
}

export function describeAudioConfiguration(
  profile: AudioProfile,
  configuration: AudioConfigurationOption
): string {
  const sampleRateHz = configuration.sampleRateHz ?? profile.sampleRateHz;
  const bitDepth = configuration.bitDepth ?? profile.bitDepth;
  const technicalDetails = [
    configuration.layout,
    formatSampleRate(sampleRateHz),
    bitDepth ? `${bitDepth}-bit` : '',
    formatAudioRate(profile, configuration),
  ].filter(Boolean);

  return technicalDetails.join(' - ');
}
