import { getBundledCodecCategories } from '../data/loadCodecCatalog';
import type { CodecCategory, CodecVariant } from '../types/codecs';
import { normalizeCalculatorAudio } from './calculatorAudio';
import type { FileSizeCalculatorConfig } from './fileSizeCalculation';

/** Platform delivery tiers stored in the codec catalog for bitrate planning — not H.264 encoder profiles. */
export const PLATFORM_DELIVERY_VARIANTS = new Set([
  'SVOD Mezzanine (30 Mbps)',
  'AVOD Web Delivery',
]);

export function isPlatformDeliveryVariant(variantName: string): boolean {
  return PLATFORM_DELIVERY_VARIANTS.has(variantName);
}

export function isCalculatorSelectableVariant(variant: Pick<CodecVariant, 'name'>): boolean {
  return !PLATFORM_DELIVERY_VARIANTS.has(variant.name);
}

export function getSelectableVariants(variants: CodecVariant[]): CodecVariant[] {
  return variants.filter(isCalculatorSelectableVariant);
}

function findCodec(categories: CodecCategory[], categoryId: string, codecId: string) {
  return categories.find(category => category.id === categoryId)?.codecs.find(codec => codec.id === codecId);
}

function resolvePlatformBitrate(
  platformVariant: CodecVariant,
  resolution: string,
  frameRate: string
): number | undefined {
  const resolutionBitrates = platformVariant.bitrates[resolution];
  if (typeof resolutionBitrates === 'number') {
    return resolutionBitrates;
  }

  if (resolutionBitrates && typeof resolutionBitrates === 'object') {
    const direct = resolutionBitrates[frameRate];
    if (typeof direct === 'number') {
      return direct;
    }

    const first = Object.values(resolutionBitrates).find(value => typeof value === 'number');
    return typeof first === 'number' ? first : undefined;
  }

  return undefined;
}

function defaultEncoderProfileVariant(codecVariants: CodecVariant[]): CodecVariant | undefined {
  return (
    codecVariants.find(variant => variant.name === 'High Profile' && isCalculatorSelectableVariant(variant)) ??
    codecVariants.find(variant => variant.name === 'Main Profile' && isCalculatorSelectableVariant(variant)) ??
    getSelectableVariants(codecVariants)[0]
  );
}

/** Map platform delivery tiers and partner-branded audio to technical calculator options. */
export function normalizeCalculatorConfig(
  config: FileSizeCalculatorConfig,
  categories: CodecCategory[] = getBundledCodecCategories()
): FileSizeCalculatorConfig {
  let normalized = config;

  if (isPlatformDeliveryVariant(normalized.variant)) {
    const codec = findCodec(categories, normalized.category, normalized.codec);
    if (codec) {
      const platformVariant = codec.variants.find(variant => variant.name === normalized.variant);
      const encoderVariant = defaultEncoderProfileVariant(codec.variants);
      if (encoderVariant) {
        const videoBitrateOverrideMbps =
          normalized.videoBitrateOverrideMbps ??
          (platformVariant
            ? resolvePlatformBitrate(platformVariant, normalized.resolution, normalized.frameRate)
            : undefined);

        normalized = {
          ...normalized,
          variant: encoderVariant.name,
          videoBitrateOverrideMbps,
        };
      }
    }
  }

  return normalizeCalculatorAudio(normalized);
}
