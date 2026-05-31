import { useEffect, useState } from 'react';

type Breakpoint = 'lg' | 'xl';

const BREAKPOINT_PX: Record<Breakpoint, number> = {
  lg: 1024,
  xl: 1280,
};

/** True when viewport width is below the given Tailwind breakpoint. */
export function useBelowBreakpoint(breakpoint: Breakpoint | null): boolean {
  const [below, setBelow] = useState(() => {
    if (!breakpoint || typeof window === 'undefined') {
      return false;
    }
    return window.innerWidth < BREAKPOINT_PX[breakpoint];
  });

  useEffect(() => {
    if (!breakpoint) {
      setBelow(false);
      return;
    }

    const query = window.matchMedia(`(max-width: ${BREAKPOINT_PX[breakpoint] - 1}px)`);
    const update = () => setBelow(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [breakpoint]);

  return below;
}
