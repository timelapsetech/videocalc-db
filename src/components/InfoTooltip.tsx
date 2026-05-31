import React, { useId } from 'react';

interface InfoTooltipProps {
  content: string;
  children: React.ReactElement;
  className?: string;
}

const FOCUSABLE_TAGS = new Set(['button', 'a', 'input', 'select', 'textarea']);

function isNativeFocusable(element: React.ReactElement): boolean {
  return typeof element.type === 'string' && FOCUSABLE_TAGS.has(element.type);
}

/**
 * Accessible hover/focus tooltip that works inside links and other interactive parents
 * (native `title` is often suppressed or clipped in those cases).
 */
const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, children, className = '' }) => {
  const tooltipId = useId();
  const focusable = isNativeFocusable(children);
  const mergedClassName = [
    children.props.className,
    'outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
  ]
    .filter(Boolean)
    .join(' ');

  const trigger = React.cloneElement(children, {
    'aria-describedby': tooltipId,
    className: mergedClassName,
    ...(focusable ? {} : { tabIndex: children.props.tabIndex ?? -1 }),
  });

  return (
    <span className={`relative inline-flex group/tooltip ${className}`.trim()}>
      {trigger}
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-[100] w-max max-w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-gray-600 bg-dark-primary px-2.5 py-2 text-left text-xs leading-relaxed text-gray-200 shadow-lg opacity-0 invisible transition-opacity duration-150 group-hover/tooltip:visible group-hover/tooltip:opacity-100 group-focus-within/tooltip:visible group-focus-within/tooltip:opacity-100"
      >
        {content}
        <span
          className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-600"
          aria-hidden
        />
      </span>
    </span>
  );
};

export default InfoTooltip;
