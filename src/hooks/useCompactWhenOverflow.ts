import { useLayoutEffect, useState, type RefObject } from 'react';

interface UseCompactWhenOverflowOptions {
  /** Extra pixels to reserve for adjacent controls (e.g. menu button) */
  reservedWidth?: number;
  /** For wrapped layouts: collapse when content is taller than one row */
  maxHeight?: number;
  enabled?: boolean;
}

/**
 * Returns true when `content` does not fit inside `container` (or reserved space within it).
 * Re-evaluates on resize via ResizeObserver.
 */
export function useCompactWhenOverflow(
  containerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  options: UseCompactWhenOverflowOptions = {}
): boolean {
  const { reservedWidth = 0, maxHeight, enabled = true } = options;
  const [compact, setCompact] = useState(true);

  useLayoutEffect(() => {
    if (!enabled) {
      setCompact(false);
      return;
    }

    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) {
      return;
    }

    const update = () => {
      const availableWidth = Math.max(0, container.clientWidth - reservedWidth);
      const widthOverflow = content.scrollWidth > availableWidth + 1;

      if (maxHeight !== undefined) {
        setCompact(widthOverflow || content.scrollHeight > maxHeight + 1);
        return;
      }

      setCompact(widthOverflow);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(container);
    observer.observe(content);

    return () => observer.disconnect();
  }, [containerRef, contentRef, enabled, maxHeight, reservedWidth]);

  return compact;
}
