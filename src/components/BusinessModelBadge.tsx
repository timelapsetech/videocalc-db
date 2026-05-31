import React from 'react';
import {
  getBusinessModelDefinition,
  getBusinessModelTooltip,
  type StreamingBusinessModel,
} from '../data/streamingBusinessModels';

interface BusinessModelBadgeProps {
  model: StreamingBusinessModel;
  size?: 'sm' | 'md';
  /** Show acronym expansion and description on hover. Defaults to true. */
  showTooltip?: boolean;
}

const BusinessModelBadge: React.FC<BusinessModelBadgeProps> = ({
  model,
  size = 'sm',
  showTooltip = true,
}) => {
  const definition = getBusinessModelDefinition(model);
  const sizeClass = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClass} ${definition.badgeClass} ${
        showTooltip ? 'cursor-help' : ''
      }`}
      title={showTooltip ? getBusinessModelTooltip(model) : undefined}
    >
      {definition.shortLabel}
    </span>
  );
};

export default BusinessModelBadge;
