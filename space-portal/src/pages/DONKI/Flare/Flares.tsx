// This file defines the Flares page, which fetches and displays solar flare events with details and classification.
// It uses React hooks for state and effects, and provides expandable details for each event.

import React, { useEffect, useState } from 'react'; // Import React hooks for managing state and side effects
import { api } from '../../../lib/api'; // Import API utility for making HTTP requests
import './Flares.css'; // Import CSS styling for the Flares page
import { SpaceEventItem } from '../../../components/SpaceEventItem'; // Import global SpaceEventItem component

// ...imports stay the same

type Event = {
  id: number;
  eventTypeId: number;
  externalId?: string;
  name?: string;
  description?: string;
  startAt?: string;
  occuredAt?: string;
  endAt?: string;
};

function extractFlareClass(text?: string): string | null {
  if (!text) return null;
  const m = text.toUpperCase().match(/\b([ABCMX])\s*\d+(?:\.\d+)?\b/);
  return m ? m[0].replace(/\s+/g, '') : null;
}

function explainClassBucket(classStr?: string | null): string {
  if (!classStr) {
    return 'Class not provided. Typical classification uses A, B, C, M, X with numbers indicating strength within the class.';
  }
  switch (classStr[0].toUpperCase()) {
    case 'A': return 'A-class: very small flares; weakest category, rarely impactful.';
    case 'B': return 'B-class: small flares; minimal effects.';
    case 'C': return 'C-class: common, modest flares; minor near-Earth effects.';
    case 'M': return 'M-class: medium/strong; can cause shortwave radio blackouts at high latitudes.';
    case 'X': return 'X-class: strongest; can cause global radio blackouts and radiation storms.';
    default:  return 'Unknown class.';
  }
}

export default function Flares() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState<string>('');
  const [openKey, setOpenKey] = useState<string | null>(null); // <-- track by stable key

  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get<Event[]>('/api/event/getevent');
        setEvents(res);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Build a stable unique key for each row
  const makeUid = (e: Event, idxOnPage: number) => {
    if (e.id != null && !Number.isNaN(e.id)) return `id:${e.id}`;
    if (e.externalId) return `ext:${e.externalId}`;
    // last resort: derive from content + absolute index across pages
    const absIndex = (page - 1) * pageSize + idxOnPage;
    return `fallback:${e.name ?? 'no-name'}:${e.startAt ?? 'no-start'}:${absIndex}`;
  };

  const filteredEvents = classFilter
    ? events.filter(e => {
        const flareClass = extractFlareClass(e.name) || extractFlareClass(e.description);
        return flareClass && flareClass[0].toUpperCase() === classFilter;
      })
    : events;

  const paginatedEvents = filteredEvents.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredEvents.length / pageSize);

  return (
    <div className="flares">
      <header className="flares__intro">
        <h1>Solar Flares</h1>
        <p>
          <strong>What is a solar flare?</strong> A solar flare is a sudden, intense burst of radiation from the Sun’s
          atmosphere caused by the rapid release of magnetic energy near sunspots. When twisted magnetic field lines
          reconnect, particles accelerate and plasma heats, producing bright emissions across X-ray, UV, and visible
          bands. Strong flares can disrupt radio communications on Earth and contribute to space-weather disturbances.
        </p>
      </header>

      {loading && <p className="flares__status">Loading…</p>}
      {error && <p className="flares__status flares__status--error">{error}</p>}

      <div style={{ margin: '1rem 0', textAlign: 'center' }}>
        <label htmlFor="classFilter" style={{ color: '#b0b3b8', marginRight: '0.5rem' }}>Filter by class:</label>
        <select
          id="classFilter"
          value={classFilter}
          onChange={e => { setClassFilter(e.target.value); setPage(1); }} // reset to page 1 on filter change
          style={{ padding: '0.5rem', borderRadius: '6px', background: '#23242a', color: '#e3e3e3', border: 'none' }}
        >
          <option value="">All</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="M">M</option>
          <option value="X">X</option>
        </select>
      </div>

      <ul className="flares__list">
        {!loading && !error && paginatedEvents.length === 0 && (
          <li className="flares__empty">No events found.</li>
        )}

        {paginatedEvents.map((e, idx) => {
          const uid = makeUid(e, idx);
          return (
            <SpaceEventItem
              key={uid}               // <-- React key
              uid={uid}               // <-- stable DOM id + open key
              event={e}
              extractClass={(name, desc) => extractFlareClass(name) || extractFlareClass(desc)}
              explainClass={explainClassBucket}
              isOpen={openKey === uid}
              onToggle={() => setOpenKey(openKey === uid ? null : uid)}
            />
          );
        })}
      </ul>

      {totalPages > 1 && (
        <div style={{ textAlign: 'center', margin: '1rem 0' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', background: '#23242a', color: '#e3e3e3', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          <span style={{ color: '#b0b3b8', margin: '0 0.5rem' }}>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', background: '#23242a', color: '#e3e3e3', border: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

