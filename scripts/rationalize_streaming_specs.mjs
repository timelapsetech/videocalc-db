#!/usr/bin/env node
/**
 * Canonicalize streaming delivery calculator configs, apply shared templates,
 * and remove duplicate partner-branded audio configuration rows.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STREAMING_PATH = path.join(ROOT, 'data/streaming-services.json');
const TEMPLATES_PATH = path.join(ROOT, 'data/streaming-calculator-templates.json');
const AUDIO_PATH = path.join(ROOT, 'data/audio-configurations.json');
const CODECS_PATH = path.join(ROOT, 'data/codecs.json');

const AUDIO_ALIASES = {
  'stereo-vimeo-320': 'stereo-320',
  'stereo-youtube-384': 'stereo-384',
  'stereo-prime-320': 'stereo-320',
  'stereo-tubi-192': 'stereo-192',
  'surround-5-1-youtube-512': 'surround-5-1-512',
  'surround-prime-aac-768': 'surround-5-1-768',
};

const PLATFORM_VARIANTS = {
  'SVOD Mezzanine (30 Mbps)': 'High Profile',
  'AVOD Web Delivery': 'High Profile',
};

const PARTNER_AUDIO_IDS = new Set(Object.keys(AUDIO_ALIASES));

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function findVariant(codecs, category, codecId, variantName) {
  const categoryData = codecs.categories.find(item => item.id === category);
  const codec = categoryData?.codecs.find(item => item.id === codecId);
  return codec?.variants.find(item => item.name === variantName);
}

function resolvePlatformMbps(variant, resolution, frameRate) {
  const resolutionBitrates = variant?.bitrates?.[resolution];
  if (typeof resolutionBitrates === 'number') {
    return resolutionBitrates;
  }
  if (resolutionBitrates && typeof resolutionBitrates === 'object') {
    const direct = resolutionBitrates[frameRate];
    if (typeof direct === 'number') {
      return direct;
    }
    return Object.values(resolutionBitrates).find(value => typeof value === 'number');
  }
  return undefined;
}

function canonicalizeCalculator(calc, codecs) {
  const next = { ...calc };

  if (next.audioConfigurationId && AUDIO_ALIASES[next.audioConfigurationId]) {
    next.audioConfigurationId = AUDIO_ALIASES[next.audioConfigurationId];
  }

  if (PLATFORM_VARIANTS[next.variant]) {
    const platformVariant = findVariant(codecs, next.category, next.codec, next.variant);
    next.videoBitrateOverrideMbps =
      next.videoBitrateOverrideMbps ??
      resolvePlatformMbps(platformVariant, next.resolution, next.frameRate);
    next.variant = PLATFORM_VARIANTS[next.variant];
  }

  return next;
}

function stableKey(value) {
  return JSON.stringify(value, Object.keys(value).sort());
}

function main() {
  const streaming = loadJson(STREAMING_PATH);
  const templatesFile = loadJson(TEMPLATES_PATH);
  const codecs = loadJson(CODECS_PATH);
  const audio = loadJson(AUDIO_PATH);

  const templateEntries = Object.entries(templatesFile.templates).map(([id, calc]) => [
    id,
    canonicalizeCalculator(calc, codecs),
  ]);
  const templateByKey = new Map(templateEntries.map(([id, calc]) => [stableKey(calc), id]));

  let templateApplied = 0;
  let canonicalizedInline = 0;

  for (const service of streaming.services) {
    for (const option of service.deliveryOptions) {
      const source = option.calculatorTemplate
        ? templatesFile.templates[option.calculatorTemplate]
        : option.calculator;

      if (!source) {
        throw new Error(
          `Missing calculator for ${service.id}::${option.id} (template=${option.calculatorTemplate ?? 'none'})`
        );
      }

      const canonical = canonicalizeCalculator(source, codecs);
      const templateId = templateByKey.get(stableKey(canonical));

      if (templateId) {
        option.calculatorTemplate = templateId;
        delete option.calculator;
        templateApplied += 1;
      } else {
        option.calculator = canonical;
        delete option.calculatorTemplate;
        canonicalizedInline += 1;
      }
    }
  }

  for (const profile of Object.values(audio.codecProfiles ?? {})) {
    for (const audioProfile of profile.audioProfiles ?? []) {
      audioProfile.configurations = (audioProfile.configurations ?? []).filter(
        config => !PARTNER_AUDIO_IDS.has(config.id)
      );
    }
  }

  writeJson(STREAMING_PATH, streaming);
  writeJson(AUDIO_PATH, audio);

  console.log(`Applied shared templates: ${templateApplied}`);
  console.log(`Canonicalized inline calculators: ${canonicalizedInline}`);
  console.log(`Removed partner-branded audio configuration duplicates: ${PARTNER_AUDIO_IDS.size} IDs`);
}

main();
