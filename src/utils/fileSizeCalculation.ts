import { frameRates, resolutions } from '../data/resolutions';
import type { CodecCategory } from '../types/codecs';
import {
  getAudioProfiles,
  resolveAudioConfiguration,
  type AudioSelection,
  type ResolvedAudioConfiguration,
} from './audioConfigurations';

export interface FileSizeCalculatorConfig {
  category: string;
  codec: string;
  variant: string;
  resolution: string;
  frameRate: string;
  audioEnabled?: boolean;
  audioProfileId?: string;
  audioConfigurationId?: string;
  /** Override catalog video bitrate when platform spec differs from variant table */
  videoBitrateOverrideMbps?: number;
}

export interface Duration {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface FileSizeCalculationResult {
  bitrateMbps: number;
  videoBitrateMbps: number;
  audioBitrateMbps: number;
  fileSizeMB: number;
  fileSizeGB: number;
  fileSizeTB: number;
  totalSeconds: number;
  categoryId: string;
  codec: NonNullable<ReturnType<typeof findCodecObjects>['codec']>;
  variant: NonNullable<ReturnType<typeof findCodecObjects>['variant']>;
  resolution: NonNullable<ReturnType<typeof findCodecObjects>['resolution']>;
  frameRate: NonNullable<ReturnType<typeof findCodecObjects>['frameRate']>;
  audioConfiguration?: ResolvedAudioConfiguration;
}

function findCodecObjects(
  categories: CodecCategory[],
  calculator: FileSizeCalculatorConfig
) {
  const category = categories.find(item => item.id === calculator.category);
  const codec = category?.codecs.find(item => item.id === calculator.codec);
  const variant = codec?.variants.find(item => item.name === calculator.variant);
  const resolution = resolutions.find(item => item.id === calculator.resolution);
  const frameRate = frameRates.find(item => item.id === calculator.frameRate);

  return { category, codec, variant, resolution, frameRate };
}

const RESOLUTION_BITRATE_ALIASES: Record<string, string> = {
  '4K': 'UHD',
  UHD: '4K',
};

function resolveVideoBitrateMbps(
  variant: NonNullable<ReturnType<typeof findCodecObjects>['variant']>,
  resolutionId: string,
  frameRateId: string,
  overrideMbps?: number
): number | null {
  if (overrideMbps && overrideMbps > 0) {
    return overrideMbps;
  }

  const resolutionBitrates =
    variant.bitrates[resolutionId] ??
    (RESOLUTION_BITRATE_ALIASES[resolutionId]
      ? variant.bitrates[RESOLUTION_BITRATE_ALIASES[resolutionId]]
      : undefined);
  if (!resolutionBitrates) {
    return null;
  }

  if (typeof resolutionBitrates === 'number') {
    return resolutionBitrates;
  }

  const directBitrate = resolutionBitrates[frameRateId];
  if (typeof directBitrate === 'number' && directBitrate > 0) {
    return directBitrate;
  }

  const fallbackFrameRate = Object.keys(resolutionBitrates)[0];
  const fallbackBitrate = fallbackFrameRate ? resolutionBitrates[fallbackFrameRate] : undefined;
  return typeof fallbackBitrate === 'number' && fallbackBitrate > 0 ? fallbackBitrate : null;
}

export function buildAudioSelection(calculator: FileSizeCalculatorConfig): AudioSelection {
  return {
    enabled: Boolean(calculator.audioEnabled),
    profileId: calculator.audioProfileId ?? '',
    configurationId: calculator.audioConfigurationId ?? '',
  };
}

export function calculateFileSize(
  categories: CodecCategory[],
  calculator: FileSizeCalculatorConfig,
  duration: Duration
): FileSizeCalculationResult | null {
  const { category, codec, variant, resolution, frameRate } = findCodecObjects(categories, calculator);

  if (!category || !codec || !variant || !resolution || !frameRate) {
    return null;
  }

  const videoBitrateMbps = resolveVideoBitrateMbps(
    variant,
    calculator.resolution,
    calculator.frameRate,
    calculator.videoBitrateOverrideMbps
  );

  if (!videoBitrateMbps) {
    return null;
  }

  const totalSeconds = duration.hours * 3600 + duration.minutes * 60 + duration.seconds;
  if (totalSeconds <= 0) {
    return null;
  }

  const audioSelection = buildAudioSelection(calculator);
  const audioConfiguration = resolveAudioConfiguration(getAudioProfiles(codec, variant), audioSelection);
  const audioBitrateMbps = audioConfiguration?.bitrateMbps ?? 0;
  const totalBitrateMbps = videoBitrateMbps + audioBitrateMbps;
  const fileSizeMB = (totalBitrateMbps * totalSeconds) / 8;
  const fileSizeGB = fileSizeMB / 1024;
  const fileSizeTB = fileSizeGB / 1024;

  return {
    bitrateMbps: totalBitrateMbps,
    videoBitrateMbps,
    audioBitrateMbps,
    fileSizeMB,
    fileSizeGB,
    fileSizeTB,
    totalSeconds,
    categoryId: category.id,
    codec,
    variant,
    resolution,
    frameRate,
    audioConfiguration: audioConfiguration ?? undefined,
  };
}

export function formatFileSize(valueMB: number, useBinaryUnits: boolean): string {
  if (useBinaryUnits) {
    const gib = valueMB / 1024;
    if (gib >= 1024) {
      return `${(gib / 1024).toFixed(2)} TiB`;
    }
    if (gib >= 1) {
      return `${gib.toFixed(2)} GiB`;
    }
    return `${valueMB.toFixed(2)} MiB`;
  }

  const gb = valueMB / 1000;
  if (gb >= 1000) {
    return `${(gb / 1000).toFixed(2)} TB`;
  }
  if (gb >= 1) {
    return `${gb.toFixed(2)} GB`;
  }
  return `${valueMB.toFixed(2)} MB`;
}
