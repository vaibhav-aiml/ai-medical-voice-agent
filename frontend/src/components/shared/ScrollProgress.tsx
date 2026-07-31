import { useState, useEffect, useRef, useCallback } from 'react';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const updateProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) {
      setProgress(0);
      return;
    }
    setProgress((scrollTop / docHeight) * 100);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Show the bar
      setIsVisible(true);

      // Cancel any pending hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      // Debounced progress update via rAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updateProgress);

      // Hide after 1.5s of inactivity
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 1500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateProgress]);

  return (
    <div
      style={{
        ...styles.track,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll progress"
    >
      <div
        style={{
          ...styles.fill,
          width: `${progress}%`,
        }}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  track: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'transparent',
    zIndex: 9999,
    pointerEvents: 'none',
  },
  fill: {
    height: '100%',
    background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
    borderRadius: '0 1px 1px 0',
    transition: 'width 0.1s linear',
  },
};
