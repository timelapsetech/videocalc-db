import catalogJson from '@repo-data/codecs.json';
import type { CodecCatalogFile, CodecCategory } from '../types/codecs';

const catalog = catalogJson as CodecCatalogFile;

export function getBundledCodecCategories(): CodecCategory[] {
  return catalog.categories ?? [];
}
