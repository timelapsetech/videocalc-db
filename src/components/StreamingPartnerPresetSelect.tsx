import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Tv } from 'lucide-react';
import CustomSelect from './CustomSelect';
import type { FileSizeCalculatorConfig } from '../utils/fileSizeCalculation';
import {
  findMatchingStreamingCalculatorPreset,
  getStreamingCalculatorPresets,
  type StreamingCalculatorPreset,
} from '../utils/streamingCalculatorPresets';

interface StreamingPartnerPresetSelectProps {
  value: string;
  currentConfig: FileSizeCalculatorConfig;
  onApply: (preset: StreamingCalculatorPreset) => void;
  compact?: boolean;
}

const StreamingPartnerPresetSelect: React.FC<StreamingPartnerPresetSelectProps> = ({
  value,
  currentConfig,
  onApply,
  compact = false,
}) => {
  const presets = useMemo(() => getStreamingCalculatorPresets(), []);
  const matched = useMemo(
    () => findMatchingStreamingCalculatorPreset(currentConfig),
    [currentConfig, presets]
  );
  const activePreset = useMemo(
    () => presets.find(preset => preset.id === value) ?? matched,
    [presets, value, matched]
  );

  const options = useMemo(
    () =>
      presets.map(preset => ({
        value: preset.id,
        label: preset.label,
        description: preset.description,
      })),
    [presets]
  );

  return (
    <div
      className={
        compact
          ? 'h-full rounded-lg border border-blue-500/25 bg-blue-500/5 p-3 sm:p-4 flex flex-col'
          : 'rounded-lg border border-blue-500/25 bg-blue-500/5 p-4'
      }
    >
      <div className={`flex items-start justify-between gap-3 ${compact ? 'mb-2' : 'mb-3'}`}>
        <div>
          <p className="text-sm font-medium text-white flex items-center gap-2 flex-wrap">
            <Tv className="h-4 w-4 text-blue-400 shrink-0" aria-hidden />
            <span>Streaming partner spec</span>
            <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
              Beta
            </span>
          </p>
          <p className={`mt-1 text-xs text-gray-400 leading-relaxed ${compact ? 'hidden sm:block' : ''}`}>
            Load a delivery option from the streaming catalog into this calculator.
          </p>
        </div>
        <Link
          to="/streaming-services"
          className="shrink-0 text-xs text-blue-300 hover:text-blue-200 whitespace-nowrap"
        >
          Browse all
        </Link>
      </div>
      <div className={compact ? 'mt-auto' : undefined}>
        <CustomSelect
          label="Partner delivery option"
          value={value}
          onChange={id => {
            const preset = presets.find(item => item.id === id);
            if (preset) {
              onApply(preset);
            }
          }}
          options={options}
          placeholder={`Choose from ${presets.length} partner specs…`}
        />
        {activePreset && (
          <p className="mt-2 text-xs text-gray-500">
            Active:{' '}
            <Link to={activePreset.detailPath} className="text-blue-300 hover:text-blue-200">
              {activePreset.label}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default StreamingPartnerPresetSelect;
