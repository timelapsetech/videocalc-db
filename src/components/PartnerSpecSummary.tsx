import React, { useMemo } from 'react';
import {
  Clock,
  Film,
  Gauge,
  HardDrive,
  Package,
  Palette,
  Radio,
  Settings,
  Subtitles,
  Tag,
  Truck,
  Volume2,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { frameRates, resolutions } from '../data/resolutions';
import type { CodecCategory } from '../types/codecs';
import type { StreamingDeliveryOption } from '../types/streamingServices';
import {
  describeAudioConfiguration,
  formatAudioRate,
  getAudioProfiles,
  resolveAudioConfiguration,
} from '../utils/audioConfigurations';
import type { FileSizeCalculationResult } from '../utils/fileSizeCalculation';
import { buildAudioSelection } from '../utils/fileSizeCalculation';

function specIcon(label: string): LucideIcon {
  const normalized = label.toLowerCase();

  if (normalized.includes('codec') || normalized.includes('profile')) {
    return Film;
  }
  if (
    normalized.includes('container') ||
    normalized.includes('protocol') ||
    normalized.includes('packaging')
  ) {
    return Package;
  }
  if (normalized.includes('resolution') || normalized.includes('aspect')) {
    return HardDrive;
  }
  if (normalized.includes('frame')) {
    return Clock;
  }
  if (normalized.includes('bitrate') || normalized.includes('bit rate')) {
    return Gauge;
  }
  if (
    normalized.includes('audio') ||
    normalized.includes('loudness') ||
    normalized.includes('sample')
  ) {
    return Volume2;
  }
  if (normalized.includes('caption') || normalized.includes('subtitle')) {
    return Subtitles;
  }
  if (normalized.includes('color') || normalized.includes('hdr') || normalized.includes('bit depth')) {
    return Palette;
  }
  if (
    normalized.includes('workflow') ||
    normalized.includes('delivery') ||
    normalized.includes('output') ||
    normalized.includes('ingest')
  ) {
    return Truck;
  }
  if (
    normalized.includes('metadata') ||
    normalized.includes('manifest') ||
    normalized.includes('epg') ||
    normalized.includes('feed')
  ) {
    return Radio;
  }

  return Tag;
}

function SpecItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
      <div className="min-w-0">
        <div className="text-sm text-gray-400">{label}</div>
        <div className="font-medium leading-snug text-white">{value}</div>
      </div>
    </div>
  );
}

function SpecSection({
  title,
  icon: SectionIcon,
  specs,
}: {
  title: string;
  icon: LucideIcon;
  specs: StreamingDeliveryOption['videoSpecs'];
}) {
  if (specs.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-blue-600/20 pt-5 first:border-t-0 first:pt-0">
      <div className="mb-4 flex items-center gap-2">
        <SectionIcon className="h-4 w-4 text-blue-400" />
        <h4 className="text-sm font-medium text-blue-300">{title}</h4>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {specs.map(spec => (
          <SpecItem
            key={`${title}-${spec.label}`}
            icon={specIcon(spec.label)}
            label={spec.label}
            value={spec.value}
          />
        ))}
      </div>
    </div>
  );
}

interface PartnerSpecSummaryProps {
  option: StreamingDeliveryOption;
  categories: CodecCategory[];
  results: FileSizeCalculationResult | null;
}

const PartnerSpecSummary: React.FC<PartnerSpecSummaryProps> = ({
  option,
  categories,
  results,
}) => {
  const calculatorDisplay = useMemo(() => {
    if (results) {
      return {
        codecName: results.codec.name,
        variantName: results.variant.name,
        resolutionName: results.resolution.name,
        frameRateName: results.frameRate.name,
        videoBitrateMbps: results.videoBitrateMbps,
        audioConfiguration: results.audioConfiguration,
      };
    }

    const category = categories.find(item => item.id === option.calculator.category);
    const codec = category?.codecs.find(item => item.id === option.calculator.codec);
    const variant = codec?.variants.find(item => item.name === option.calculator.variant);
    const resolution = resolutions.find(item => item.id === option.calculator.resolution);
    const frameRate = frameRates.find(item => item.id === option.calculator.frameRate);
    const audioConfiguration = resolveAudioConfiguration(
      getAudioProfiles(codec, variant),
      buildAudioSelection(option.calculator)
    );

    if (!codec || !variant || !resolution || !frameRate) {
      return null;
    }

    const resolutionBitrates = variant.bitrates[resolution.id];
    let catalogVideoMbps: number | undefined;
    if (typeof resolutionBitrates === 'number') {
      catalogVideoMbps = resolutionBitrates;
    } else if (resolutionBitrates && typeof resolutionBitrates === 'object') {
      const direct = resolutionBitrates[frameRate.id];
      catalogVideoMbps = typeof direct === 'number' ? direct : undefined;
    }

    return {
      codecName: codec.name,
      variantName: variant.name,
      resolutionName: resolution.name,
      frameRateName: frameRate.name,
      videoBitrateMbps: option.calculator.videoBitrateOverrideMbps ?? catalogVideoMbps,
      audioConfiguration: audioConfiguration ?? undefined,
    };
  }, [categories, option, results]);

  return (
    <div className="rounded-lg border border-blue-600/20 bg-blue-600/10 p-6">
      <div className="mb-5 flex items-center gap-2">
        <Settings className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-medium text-blue-400">Contribution Spec Summary</h3>
      </div>

      {calculatorDisplay && (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <SpecItem icon={Film} label="Codec" value={calculatorDisplay.codecName} />
            <SpecItem icon={Zap} label="Variant" value={calculatorDisplay.variantName} />
          </div>
          <div className="space-y-4">
            <SpecItem icon={HardDrive} label="Resolution" value={calculatorDisplay.resolutionName} />
            <SpecItem icon={Clock} label="Frame Rate" value={calculatorDisplay.frameRateName} />
          </div>
        </div>
      )}

      {calculatorDisplay?.videoBitrateMbps != null && (
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="rounded-lg border border-blue-600/15 bg-dark-primary/60 px-4 py-2.5">
            <div className="text-xs text-gray-400">Planning video bitrate</div>
            <div className="text-sm font-semibold text-white">
              {Number(calculatorDisplay.videoBitrateMbps).toFixed(2)} Mbps
            </div>
          </div>
          {calculatorDisplay.audioConfiguration && (
            <div className="rounded-lg border border-blue-600/15 bg-dark-primary/60 px-4 py-2.5">
              <div className="text-xs text-gray-400">Audio in estimate</div>
              <div className="text-sm font-semibold text-blue-300">
                {formatAudioRate(
                  calculatorDisplay.audioConfiguration.profile,
                  calculatorDisplay.audioConfiguration.configuration
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {calculatorDisplay?.audioConfiguration && (
        <div className="mb-6 border-t border-blue-600/20 pt-4">
          <div className="text-sm text-gray-400">Audio profile</div>
          <div className="mt-1 font-medium text-white">
            {calculatorDisplay.audioConfiguration.profile.name} —{' '}
            {calculatorDisplay.audioConfiguration.configuration.label}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {describeAudioConfiguration(
              calculatorDisplay.audioConfiguration.profile,
              calculatorDisplay.audioConfiguration.configuration
            )}
          </div>
        </div>
      )}

      <div className="space-y-5">
        <SpecSection title="Video requirements" icon={Film} specs={option.videoSpecs} />
        <SpecSection title="Audio requirements" icon={Volume2} specs={option.audioSpecs} />
        <SpecSection title="Container & delivery" icon={Package} specs={option.containerSpecs} />
      </div>
    </div>
  );
};

export default PartnerSpecSummary;
