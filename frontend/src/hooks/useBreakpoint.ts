import { useState, useEffect, useRef } from 'react';

export function useBreakpoint() {
  const [width, setWidth] = useState(window.innerWidth);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const onResize = () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => setWidth(window.innerWidth));
    };

    window.addEventListener('resize', onResize);

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return {
    width,
    isMobile: width <= 480,
    isTablet: width > 480 && width <= 768
  };
}
