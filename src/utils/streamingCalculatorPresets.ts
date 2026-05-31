import { getStreamingServicesCatalog } from '../data/loadStreamingServices';
import { normalizeCalculatorConfig } from './calculatorVariants';
import type { FileSizeCalculatorConfig } from './fileSizeCalculation';

export interface StreamingCalculatorPreset {
  id: string;
  serviceId: string;
  serviceName: string;
  optionId: string;
  optionName: string;
  label: string;
  description: string;
  calculator: FileSizeCalculatorConfig;
  detailPath: string;
}

let cachedPresets: StreamingCalculatorPreset[] | null = null;

export function getStreamingCalculatorPresets(): StreamingCalculatorPreset[] {
  if (cachedPresets) {
    return cachedPresets;
  }

  const catalog = getStreamingServicesCatalog();
  cachedPresets = catalog.services
    .flatMap(service =>
      service.deliveryOptions.map(option => ({
        id: `${service.id}::${option.id}`,
        serviceId: service.id,
        serviceName: service.name,
        optionId: option.id,
        optionName: option.name,
        label: `${service.name} — ${option.name}`,
        description: `${option.deliveryTier} · ${option.calculator.codec} / ${option.calculatorTemplate ?? option.calculator.variant}`,
        calculator: normalizeCalculatorConfig({
          category: option.calculator.category,
          codec: option.calculator.codec,
          variant: option.calculator.variant,
          resolution: option.calculator.resolution,
          frameRate: option.calculator.frameRate,
          audioEnabled: option.calculator.audioEnabled,
          audioProfileId: option.calculator.audioProfileId,
          audioConfigurationId: option.calculator.audioConfigurationId,
          videoBitrateOverrideMbps: option.calculator.videoBitrateOverrideMbps,
        }),
        detailPath: `/streaming-services/${service.id}?option=${option.id}`,
      }))
    )
    .sort(
      (a, b) =>
        a.serviceName.localeCompare(b.serviceName) || a.optionName.localeCompare(b.optionName)
    );

  return cachedPresets;
}

export function streamingCalculatorPresetMatches(
  preset: StreamingCalculatorPreset,
  current: FileSizeCalculatorConfig
): boolean {
  const calc = preset.calculator;
  const normalizedCurrent = normalizeCalculatorConfig(current);
  return (
    normalizedCurrent.category === calc.category &&
    normalizedCurrent.codec === calc.codec &&
    normalizedCurrent.variant === calc.variant &&
    normalizedCurrent.resolution === calc.resolution &&
    normalizedCurrent.frameRate === calc.frameRate &&
    (normalizedCurrent.audioEnabled ?? false) === (calc.audioEnabled ?? false) &&
    (normalizedCurrent.audioProfileId ?? '') === (calc.audioProfileId ?? '') &&
    (normalizedCurrent.audioConfigurationId ?? '') === (calc.audioConfigurationId ?? '') &&
    (normalizedCurrent.videoBitrateOverrideMbps ?? undefined) === (calc.videoBitrateOverrideMbps ?? undefined)
  );
}

export function findMatchingStreamingCalculatorPreset(
  current: FileSizeCalculatorConfig,
  preferredPresetId?: string
): StreamingCalculatorPreset | undefined {
  const presets = getStreamingCalculatorPresets();

  if (preferredPresetId) {
    const preferred = presets.find(preset => preset.id === preferredPresetId);
    if (preferred && streamingCalculatorPresetMatches(preferred, current)) {
      return preferred;
    }
  }

  return presets.find(preset => streamingCalculatorPresetMatches(preset, current));
}
