// Simplified carousel with optional APOD auto-fetch.
// If `apod` prop is provided, component fetches recent APOD entries directly from backend.
import React, { useEffect, useState, useCallback } from 'react';
import './Carousel.css';
import { api, ApodDto } from '../lib/api';

interface CarouselImageItem {
  url: string;
  title?: string;
  copyright?: string;
  date?: string;
}

interface CarouselProps {
  images?: string[]; // Legacy static image URLs
  intervalMs?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
  ariaLabel?: string;
  apod?: { limit?: number }; // Enable APOD mode
}

const Carousel: React.FC<CarouselProps> = ({
  images,
  intervalMs = 6000,
  showDots = true,
  showArrows = true,
  className = '',
  ariaLabel = 'Image carousel',
  apod
}) => {
  const [items, setItems] = useState<CarouselImageItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build items when static images passed
  useEffect(() => {
    if (images && images.length) {
      setItems(images.map((u) => ({ url: u })));
    }
  }, [images]);

  // APOD auto-fetch mode
  useEffect(() => {
    if (!apod) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const limit = (apod?.limit ?? 5);
        const list = await api.getApodRecent(limit);
        const mapped: CarouselImageItem[] = list
          .filter(a => a.mediaType === 'image')
          .map((a: ApodDto) => ({
            url: a.url || a.hdUrl || '',
            title: a.title,
            copyright: a.copyright,
            date: a.date
          }))
          .filter(i => !!i.url);
        if (!cancelled) {
          setItems(mapped);
          setIndex(0);
          if (!mapped.length) setError('No APOD images available');
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load APOD images');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [apod]);

  // Autoplay
  useEffect(() => {
    if (items.length <= 1) return;
    const id = setTimeout(() => setIndex(i => (i + 1) % items.length), intervalMs);
    return () => clearTimeout(id);
  }, [items, index, intervalMs]);

  const goTo = useCallback((i: number) => {
    setIndex((prev) => {
      if (!items.length) return prev;
      const next = ((i % items.length) + items.length) % items.length;
      return next;
    });
  }, [items]);

  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  return (
    <div
      className={`carousel-container ${className}`.trim()}
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      {showArrows && items.length > 1 && (
        <button type="button" className="carousel-btn prev" onClick={prev} aria-label="Previous slide">❮</button>
      )}
      <div className="carousel-viewport">
        {loading && <div className="carousel-loading">Loading...</div>}
        {!loading && error && <div className="carousel-fallback">{error}</div>}
        {!loading && !error && !items.length && (
          <div className="carousel-fallback">No images</div>
        )}
        {items.map((img, i) => (
          <div
            key={img.url + i}
            className={`carousel-slide ${i === index ? 'active' : ''}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${i + 1} of ${items.length}`}
            aria-hidden={i !== index}
          >
            {i === index && (
              <>
                <img
                  src={img.url}
                  alt={img.title || `APOD ${img.date || ''}`}
                  className="carousel-image"
                  loading="lazy"
                />
                {(img.title || img.copyright) && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    width: '100%',
                    padding: '0.4rem 0.75rem',
                    fontSize: '.75rem',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.65))',
                    color: '#fff',
                    textAlign: 'left'
                  }}>
                    <strong>{img.title}</strong>{img.copyright ? ` · © ${img.copyright}` : ''}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      {showArrows && items.length > 1 && (
        <button type="button" className="carousel-btn next" onClick={next} aria-label="Next slide">❯</button>
      )}
      {showDots && items.length > 1 && (
        <div className="carousel-dots" role="tablist" aria-label="Carousel navigation">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`dot ${i === index ? 'active' : ''}`}
              aria-label={`Go to slide ${i + 1}`}
              aria-selected={i === index}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
