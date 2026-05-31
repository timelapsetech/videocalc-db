import React from 'react';
import InfoTooltip from './InfoTooltip';
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

  const badge = (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClass} ${definition.badgeClass} ${
        showTooltip ? 'cursor-help' : ''
      }`}
    >
      {definition.shortLabel}
    </span>
  );

  if (!showTooltip) {
    return badge;
  }

  return <InfoTooltip content={getBusinessModelTooltip(model)}>{badge}</InfoTooltip>;
};

export default BusinessModelBadge;
