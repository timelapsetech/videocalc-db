import React from 'react';
import { ExternalLink } from 'lucide-react';
import { getSpecSourceDefinition, resolveSpecSourceType, type SpecSourceType } from '../utils/specSource';

interface SpecSourceLinkProps {
  href: string;
  serviceWebsiteUrl?: string;
  override?: SpecSourceType;
  short?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Compact chip + optional note below (service detail header) */
  showDescription?: boolean;
  /** Pill-style chip link */
  variant?: 'text' | 'chip';
}

const SpecSourceLink: React.FC<SpecSourceLinkProps> = ({
  href,
  serviceWebsiteUrl,
  override,
  short = false,
  className = '',
  onClick,
  showDescription = false,
  variant = 'text',
}) => {
  const type = resolveSpecSourceType(href, { serviceWebsiteUrl, override });
  const definition = getSpecSourceDefinition(type);
  const label = short ? definition.shortLabel : definition.linkLabel;

  const chipClass =
    variant === 'chip'
      ? 'inline-flex w-fit max-w-full items-center gap-1 rounded-full border border-gray-700 bg-dark-secondary px-3 py-1 text-gray-400'
      : 'inline-flex w-fit max-w-full items-center gap-1 text-gray-400';

  if (type === 'not-found') {
    return (
      <div className="max-w-3xl">
        <span title={definition.description} className={`${chipClass} ${className}`.trim()}>
          <span className="truncate">{label}</span>
        </span>
        {showDescription && (
          <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{definition.description}</p>
        )}
      </div>
    );
  }

  const link = (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      title={definition.description}
      className={`${
        variant === 'chip'
          ? 'inline-flex w-fit max-w-full items-center gap-1 rounded-full border border-gray-700 bg-dark-secondary px-3 py-1 text-blue-300 hover:border-blue-500/40'
          : 'inline-flex w-fit max-w-full items-center gap-1'
      } ${className}`.trim()}
    >
      <span className="truncate">{label}</span>
      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
    </a>
  );

  if (!showDescription || type === 'official') {
    return link;
  }

  return (
    <div className="max-w-3xl">
      {link}
      <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{definition.description}</p>
    </div>
  );
};

export default SpecSourceLink;
