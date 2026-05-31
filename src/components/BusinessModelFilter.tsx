import React, { useRef } from 'react';
import { Filter } from 'lucide-react';
import InfoTooltip from './InfoTooltip';
import {
  STREAMING_BUSINESS_MODELS,
  getBusinessModelTooltip,
  type StreamingBusinessModel,
} from '../data/streamingBusinessModels';
import { useCompactWhenOverflow } from '../hooks/useCompactWhenOverflow';

interface BusinessModelFilterProps {
  value: StreamingBusinessModel | 'all';
  onChange: (value: StreamingBusinessModel | 'all') => void;
  modelCounts: Map<StreamingBusinessModel, number>;
  totalCount: number;
}

const BusinessModelFilter: React.FC<BusinessModelFilterProps> = ({
  value,
  onChange,
  modelCounts,
  totalCount,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const activeModels = (Object.keys(STREAMING_BUSINESS_MODELS) as StreamingBusinessModel[]).filter(
    model => (modelCounts.get(model) ?? 0) > 0
  );

  const useSelect = useCompactWhenOverflow(containerRef, measureRef);

  const pillClass = (active: boolean, activeClass?: string) =>
    `rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
      active
        ? activeClass ?? 'border-blue-500/50 bg-blue-500/20 text-blue-200'
        : 'border-gray-700 bg-dark-secondary text-gray-400 hover:border-gray-600'
    }`;

  const selectControl = (
    <>
      <label htmlFor="business-model-filter" className="sr-only">
        Filter by business model
      </label>
      <div className="relative">
        <Filter
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          aria-hidden
        />
        <select
          id="business-model-filter"
          value={value}
          onChange={event => onChange(event.target.value as StreamingBusinessModel | 'all')}
          className="w-full appearance-none rounded-lg border border-gray-700 bg-dark-secondary py-3 pl-10 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All business models ({totalCount})</option>
          {activeModels.map(model => {
            const definition = STREAMING_BUSINESS_MODELS[model];
            const count = modelCounts.get(model) ?? 0;
            return (
              <option key={model} value={model}>
                {definition.label} ({count})
              </option>
            );
          })}
        </select>
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"
          aria-hidden
        >
          ▾
        </span>
      </div>
      {value !== 'all' && (
        <p className="mt-2 text-xs text-gray-500 leading-relaxed">
          {getBusinessModelTooltip(value)}
        </p>
      )}
    </>
  );

  return (
    <div ref={containerRef} className="relative mb-4">
      {/* Measure pills in a single nowrap row */}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute left-0 top-0 flex flex-nowrap gap-2"
      >
        <span className={pillClass(value === 'all')}>All models ({totalCount})</span>
        {activeModels.map(model => {
          const definition = STREAMING_BUSINESS_MODELS[model];
          const count = modelCounts.get(model) ?? 0;
          return (
            <span key={model} className={pillClass(value === model, definition.badgeClass)}>
              {definition.shortLabel} ({count})
            </span>
          );
        })}
      </div>

      {useSelect ? (
        selectControl
      ) : (
        <div className="flex flex-nowrap gap-2 overflow-x-auto overflow-y-visible pb-1">
          <button
            type="button"
            onClick={() => onChange('all')}
            className={pillClass(value === 'all')}
          >
            All models ({totalCount})
          </button>
          {activeModels.map(model => {
            const definition = STREAMING_BUSINESS_MODELS[model];
            const count = modelCounts.get(model) ?? 0;
            return (
              <InfoTooltip key={model} content={getBusinessModelTooltip(model)}>
                <button
                  type="button"
                  onClick={() => onChange(model)}
                  className={`${pillClass(value === model, definition.badgeClass)} cursor-help`}
                >
                  {definition.shortLabel} ({count})
                </button>
              </InfoTooltip>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BusinessModelFilter;
