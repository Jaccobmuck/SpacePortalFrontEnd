// GST (Geomagnetic Storm) page
// Fetches and displays geomagnetic storm events with expandable details and pagination.

import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import './GST.css';
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

function extractKpIndex(name?: string, desc?: string): string | null {
  const text = name || desc || '';
  const match = text.match(/Kp\s*([\d.]+)/i);
  return match ? `Kp ${match[1]}` : null;
}

function explainKpIndex(kp?: string | null): string {
  if (!kp) {
    return 'Kp index not available. The Kp index measures geomagnetic activity on a scale of 0-9.';
  }
  const val = parseFloat(kp.replace(/[^0-9.]/g, ''));
  if (isNaN(val)) {
    return 'Kp index measures geomagnetic activity on a scale of 0-9.';
  }
  if (val < 4) {
    return `${kp}: Quiet to unsettled conditions. Minor effects possible at high latitudes.`;
  }
  if (val < 5) {
    return `${kp}: Active conditions. Possible weak power grid fluctuations; aurora visible at high latitudes.`;
  }
  if (val < 6) {
    return `${kp}: Minor storm (G1). Weak power grid fluctuations; aurora visible at ~60° latitude.`;
  }
  if (val < 7) {
    return `${kp}: Moderate storm (G2). High-latitude power systems may experience voltage alarms; aurora at ~55° latitude.`;
  }
  if (val < 8) {
    return `${kp}: Strong storm (G3). Voltage corrections may be required; aurora at ~50° latitude.`;
  }
  if (val < 9) {
    return `${kp}: Severe storm (G4). Widespread voltage control problems; aurora at ~45° latitude.`;
  }
  return `${kp}: Extreme storm (G5). Widespread blackouts and transformer damage possible; aurora visible at very low latitudes.`;
}

export default function GST() {
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
        // Filter to only Geomagnetic Storm events (EventTypeId = 7)
        const gstEvents = res.filter(e => e.eventTypeId === 7);
        setEvents(gstEvents);
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
    <div className="gst">
      <header className="gst__intro">
        <h1>Geomagnetic Storms</h1>
        <p>
          <strong>What is a Geomagnetic Storm?</strong> A geomagnetic storm is a temporary disturbance
          of Earth's magnetosphere caused by a solar wind shock wave. These storms are often triggered
          by Coronal Mass Ejections (CMEs) or high-speed solar wind streams. The intensity is measured
          by the Kp index (0-9), with higher values indicating stronger storms that can affect power
          grids, satellites, GPS systems, and produce spectacular auroras at lower latitudes.
        </p>
      </header>

      {loading && <p className="gst__status">Loading…</p>}
      {error && <p className="gst__status gst__status--error">{error}</p>}

      <ul className="gst__list">
        {!loading && !error && paginatedEvents.length === 0 && (
          <li className="gst__empty">No geomagnetic storm events found. Try importing data from the Admin panel.</li>
        )}

        {paginatedEvents.map((e, idx) => {
          const uid = makeUid(e, idx);
          return (
            <SpaceEventItem
              key={uid}
              uid={uid}
              event={e}
              extractClass={(name, desc) => extractKpIndex(name, desc)}
              explainClass={explainKpIndex}
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
