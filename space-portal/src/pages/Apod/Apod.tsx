import { useEffect, useState } from 'react';
import { api, ApodDto } from '../../lib/api';
import './Apod.css';

export default function ApodPage() {
  const [today, setToday] = useState<ApodDto | null>(null);
  const [recent, setRecent] = useState<ApodDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [t, r] = await Promise.all([
          api.getApodToday(),
          api.getApodRecent(12),
        ]);
        if (!cancelled) {
          setToday(t);
          setRecent(r);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load APOD');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="apod-page">
      <header>
        <h1>Astronomy Picture of the Day</h1>
        <p>Daily imagery & stories from NASA's APOD feed (cached via backend).</p>
      </header>

      {loading && (
        <div className="apod-loading">Loading latest APOD...</div>
      )}
      {error && (
        <div className="apod-error">{error}</div>
      )}

      {today && !loading && !error && (
        <section className="apod-hero">
          <div>
            {today.mediaType === 'video' ? (
              <iframe
                className="apod-hero-media"
                src={today.url}
                title={today.title}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img
                className="apod-hero-media"
                src={today.hdUrl || today.url}
                alt={today.title}
                loading="lazy"
              />
            )}
          </div>
          <div className="apod-meta">
            <h2>{today.title}</h2>
            <small>{today.date}{today.copyright ? ` © ${today.copyright}` : ''}</small>
            {today.explanation && (
              <p className="apod-explanation">{today.explanation}</p>
            )}
            {today.hdUrl && today.hdUrl !== today.url && (
              <p><a href={today.hdUrl} target="_blank" rel="noopener noreferrer">View HD Image ↗</a></p>
            )}
          </div>
        </section>
      )}

      {!!recent.length && (
        <section className="apod-recent-section">
          <h3>Recent Images</h3>
          <div className="apod-recent-grid">
            {recent.map(item => (
              <a
                key={item.date}
                className="apod-thumb"
                href="#" // Placeholder; could open modal later
                onClick={(e) => { e.preventDefault(); setToday(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                {item.mediaType === 'video' ? (
                  <div style={{display:'grid',placeItems:'center',aspectRatio:'1/1',background:'#0d1b2a',borderRadius:4,fontSize:'.7rem',color:'#fff',padding:4}}>
                    Video
                  </div>
                ) : (
                  <img src={item.url} alt={item.title} loading="lazy" />
                )}
                <span>{item.date}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
