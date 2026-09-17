import { useRef, useState, useEffect, ReactNode, Children } from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface MobileCarouselProps {
  children: ReactNode;
  /** Width of each card as percentage of container (default: 85) */
  peekWidth?: number;
  /** Gap between cards in px (default: 16) */
  gap?: number;
  /** Show dot indicators (default: true) */
  showDots?: boolean;
  /** Custom class for the track */
  className?: string;
}

/**
 * Instagram-style horizontal swipe carousel for mobile viewports.
 * On desktop (>600px), renders children as-is (no carousel wrapper).
 * On mobile (<=600px), wraps children in a scroll-snap horizontal track
 * with dot pagination indicators.
 */
export default function MobileCarousel({
  children,
  peekWidth = 85,
  gap = 16,
  showDots = true,
  className = '',
}: MobileCarouselProps) {
  const { isMobile } = useBreakpoint();
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const childArray = Children.toArray(children);
  const count = childArray.length;

  // Track active slide via scroll position
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !isMobile) return;

    const handleScroll = () => {
      const scrollLeft = track.scrollLeft;
      const cardWidth = track.scrollWidth / count;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(newIndex, 0), count - 1));
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => track.removeEventListener('scroll', handleScroll);
  }, [isMobile, count]);

  // Click dot → scroll to card
  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.scrollWidth / count;
    track.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
  };

  // Desktop: render children directly, no carousel
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="mobile-carousel-container">
      <div
        ref={trackRef}
        className={`mobile-carousel-track ${className}`}
        style={{ gap: `${gap}px` }}
      >
        {childArray.map((child, i) => (
          <div
            key={i}
            className="mobile-carousel-slide"
            style={{
              flex: `0 0 ${peekWidth}%`,
              scrollSnapAlign: 'start',
              minWidth: 0,
            }}
          >
            {child}
          </div>
        ))}
      </div>

      {showDots && count > 1 && (
        <div className="mobile-carousel-dots">
          {childArray.map((_, i) => (
            <button
              key={i}
              className={`mobile-carousel-dot ${i === activeIndex ? 'active' : ''}`}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
