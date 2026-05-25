import presetsJson from '@repo-data/default-presets.json';
import type { CustomPreset } from '../types/presets';

export function getBundledDefaultPresets(): CustomPreset[] {
  const raw = presetsJson as CustomPreset[];
  return Array.isArray(raw) ? raw : [];
}
