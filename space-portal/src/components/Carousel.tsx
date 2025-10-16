// Accessible, resilient image carousel with autoplay, keyboard, and touch support
import React, { useCallback, useEffect, useRef, useState } from "react";

// Component stylesheet
import './Carousel.css';

interface CarouselProps {
  // Array of image URLs to display
  images: string[];

  // Autoplay interval in milliseconds (default 5000)
  intervalMs?: number;

  // Whether to pause autoplay on pointer hover (default true)
  pauseOnHover?: boolean;

  // Initial slide index when mounting
  startIndex?: number;

  // Optional extra CSS class on root
  className?: string;

  // Show navigation dots (default true)
  showDots?: boolean;

  // Show prev/next arrow buttons (default true)
  showArrows?: boolean;

  // Accessible label for carousel region
  ariaLabel?: string;
}

const Carousel: React.FC<CarouselProps> = ({
  images,
  intervalMs = 5000,
  pauseOnHover = true,
  startIndex = 0,
  className = '',
  showDots = true,
  showArrows = true,
  ariaLabel = 'Image carousel'
}) => {
  // Current slide index (clamped to available images)
  const [currentIndex, setCurrentIndex] = useState(() => {
    return Math.min(Math.max(startIndex, 0), images.length - 1);
  });

  // Autoplay paused state (e.g., on hover)
  const [isPaused, setIsPaused] = useState(false);

  // Indices that failed to load (to optionally skip)
  const [failed, setFailed] = useState<Set<number>>(new Set());

  // Loading state for current/next image preloads
  const [loading, setLoading] = useState(true);

  // Track per-index error counts
  const errorCounts = useRef<Record<number, number>>({});

  // Touch gesture tracking
  const touchStartX = useRef<number | null>(null);

  // Ref to the focus scope for keyboard navigation
  const focusRef = useRef<HTMLDivElement | null>(null);

  // Move to the requested index (wrapping), skipping failed images when possible
  const goTo = useCallback((idx: number) => {
    setCurrentIndex((prev) => {
      if (images.length === 0) {
        return prev;
      }

      const nonFailedCount = images.length - failed.size;
      let candidate = (idx + images.length) % images.length;

      // If we have at least 2 non-failed images, keep skipping failed ones.
      // If not, allow cycling through failed images so user still sees rotation (with fallback text).
      if (nonFailedCount >= 2) {
        let guard = 0;
        while (failed.has(candidate) && guard < images.length) {
          candidate = (candidate + 1) % images.length;
          guard++;
        }
      }

      if (candidate !== prev) {
        console.debug('[Carousel] advancing to index', candidate);
      }

      return candidate;
    });
  }, [images.length, failed]);

  const prevSlide = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
  const nextSlide = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);

  // Autoplay
  useEffect(() => {
    // No need to autoplay with <= 1 image
    if (images.length <= 1) {
      return;
    }

    // Respect pause state
    if (isPaused) {
      return;
    }

    // Schedule next slide advance
    const id = setTimeout(() => {
      nextSlide();
    }, intervalMs);

    // Cleanup timeout on dependency change/unmount
    return () => {
      clearTimeout(id);
    };
  }, [currentIndex, images.length, intervalMs, isPaused, nextSlide]);

  // Preload current image (and next) to reduce flicker
  useEffect(() => {
    if (!images.length) {
      return;
    }

    setLoading(true);

    const currentSrc = images[currentIndex];
    const nextSrc = images[(currentIndex + 1) % images.length];
    const preload = [currentSrc, nextSrc].filter(Boolean);

    let cancelled = false;
    let loadedCount = 0;

    preload.forEach((src) => {
      const idx = images.indexOf(src);
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        if (cancelled) {
          return;
        }
        console.debug('[Carousel] loaded', idx, src);
        loadedCount++;

        if (failed.has(idx)) {
          // Remove from failed if it later loads
          setFailed((f) => {
            const clone = new Set(f);
            clone.delete(idx);
            return clone;
          });
        }

        if (loadedCount === preload.length) {
          setLoading(false);
        }
      };

      img.onerror = () => {
        if (cancelled) {
          return;
        }
        console.warn('[Carousel] error loading', idx, src);
        errorCounts.current[idx] = (errorCounts.current[idx] || 0) + 1;

        if (errorCounts.current[idx] >= 2) {
          setFailed((f) => new Set(f).add(idx));
        }

        setLoading(false);
      };

      img.src = src;
    });

    return () => {
      cancelled = true;
    };
  }, [currentIndex, images, failed]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only handle keys when focus is within the carousel
      if (!focusRef.current || !focusRef.current.contains(document.activeElement)) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prevSlide, nextSlide]);

  // Touch / swipe support
  const onTouchStart = (e: React.TouchEvent) => {
    // Record starting X position
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) {
      return;
    }

    const delta = e.changedTouches[0].clientX - touchStartX.current;

    if (Math.abs(delta) > 50) {
      if (delta > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }

    touchStartX.current = null;
  };

  const containerProps = pauseOnHover
    ? {
        onMouseEnter: () => {
          setIsPaused(true);
        },
        onMouseLeave: () => {
          setIsPaused(false);
        }
      }
    : {};

  return (
    <div
      className={`carousel-container ${className}`.trim()}
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      ref={focusRef}
      tabIndex={0}
      {...containerProps}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {showArrows && (
        <button
          type="button"
          className="carousel-btn prev"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          ❮
        </button>
      )}

      <div className="carousel-viewport">
        {images.map((src, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={idx}
              className={`carousel-slide ${isActive ? 'active' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${idx + 1} of ${images.length}`}
              aria-hidden={!isActive}
            >
              {isActive && !failed.has(idx) && (
                <img
                  src={src}
                  alt={`Slide ${idx + 1}`}
                  className="carousel-image"
                  loading="lazy"
                  draggable={false}
                  crossOrigin="anonymous"
                  onError={() => {
                    console.warn('[Carousel] inline <img> error', idx, src);
                    setFailed((f) => new Set(f).add(idx));
                    // Wait a tick before advancing to avoid rapid loops
                    setTimeout(() => {
                      nextSlide();
                    }, 250);
                  }}
                />
              )}
              {isActive && failed.has(idx) && (
                <div className="carousel-fallback">Image unavailable</div>
              )}
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="carousel-loading" aria-live="polite">Loading image...</div>
      )}

      {showArrows && (
        <button
          type="button"
          className="carousel-btn next"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          ❯
        </button>
      )}

      {showDots && images.length > 1 && (
        <div className="carousel-dots" role="tablist" aria-label="Carousel navigation">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              aria-label={`Go to slide ${index + 1}`}
              aria-selected={index === currentIndex}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
