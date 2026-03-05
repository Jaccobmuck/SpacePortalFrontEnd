// CME (Coronal Mass Ejection) page
// Fetches and displays CME events with expandable details and pagination.

import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import './CME.css';
import { SpaceEventItem } from '../../../components/SpaceEventItem';

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

function extractCMELocation(name?: string): string | null {
  if (!name) return null;
  const match = name.match(/CME\s+(.+)/i);
  return match ? match[1] : null;
}

function explainCME(location?: string | null): string {
  if (!location || location === 'Unknown') {
    return 'Source location not provided. CMEs originate from active regions on the Sun.';
  }
  return `This CME originated from ${location} on the solar disk. CMEs can take 1-3 days to reach Earth.`;
}

export default function CME() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get<Event[]>('/api/event/getevent');
        // Filter to only CME events (EventTypeId = 6)
        const cmeEvents = res.filter(e => e.eventTypeId === 6);
        setEvents(cmeEvents);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const makeUid = (e: Event, idxOnPage: number) => {
    if (e.id != null && !Number.isNaN(e.id)) return `id:${e.id}`;
    if (e.externalId) return `ext:${e.externalId}`;
    const absIndex = (page - 1) * pageSize + idxOnPage;
    return `fallback:${e.name ?? 'no-name'}:${e.startAt ?? 'no-start'}:${absIndex}`;
  };

  const paginatedEvents = events.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(events.length / pageSize);

  return (
    <div className="cme">
      <header className="cme__intro">
        <h1>Coronal Mass Ejections</h1>
        <p>
          <strong>What is a CME?</strong> A Coronal Mass Ejection (CME) is a massive burst of solar wind
          and magnetic fields rising above the solar corona or being released into space. CMEs can
          release billions of tons of coronal material and carry an embedded magnetic field that is
          stronger than the background solar wind. When directed at Earth, CMEs can cause geomagnetic
          storms that may disrupt satellites, power grids, and communications.
        </p>
      </header>

      {loading && <p className="cme__status">Loading…</p>}
      {error && <p className="cme__status cme__status--error">{error}</p>}

      <ul className="cme__list">
        {!loading && !error && paginatedEvents.length === 0 && (
          <li className="cme__empty">No CME events found. Try importing data from the Admin panel.</li>
        )}

        {paginatedEvents.map((e, idx) => {
          const uid = makeUid(e, idx);
          return (
            <SpaceEventItem
              key={uid}
              uid={uid}
              event={e}
              extractClass={(name) => extractCMELocation(name)}
              explainClass={explainCME}
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
