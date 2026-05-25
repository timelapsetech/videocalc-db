import catalogJson from '@repo-data/codecs.json';
import audioConfigurationJson from '@repo-data/audio-configurations.json';
import type { AudioConfigurationCatalogFile, Codec, CodecCatalogFile, CodecCategory } from '../types/codecs';

const catalog = catalogJson as CodecCatalogFile;
const audioConfigurationCatalog = audioConfigurationJson as AudioConfigurationCatalogFile;

function getVariantAudioKey(codecId: string, variantName: string): string {
  return `${codecId}::${variantName}`;
}

function attachAudioProfilesToCodec(codec: Codec): Codec {
  const codecAudioAssignment = audioConfigurationCatalog.codecProfiles?.[codec.id];

  return {
    ...codec,
    audioProfiles: codecAudioAssignment?.audioProfiles ?? codec.audioProfiles,
    defaultAudioProfileId: codecAudioAssignment?.defaultAudioProfileId ?? codec.defaultAudioProfileId,
    variants: codec.variants.map(variant => {
      const variantAudioAssignment =
        audioConfigurationCatalog.variantProfiles?.[getVariantAudioKey(codec.id, variant.name)];

      if (!variantAudioAssignment) {
        return variant;
      }

      return {
        ...variant,
        audioProfiles: variantAudioAssignment.audioProfiles,
        defaultAudioProfileId: variantAudioAssignment.defaultAudioProfileId,
      };
    }),
  };
}

export function getBundledCodecCategories(): CodecCategory[] {
  return (catalog.categories ?? []).map(category => ({
    ...category,
    codecs: category.codecs.map(attachAudioProfilesToCodec),
  }));
}
