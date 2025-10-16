// Render a single space event row with expandable details
import React from 'react';

export interface SpaceEvent {
  id: number;
  name?: string;
  description?: string;
  startAt?: string;
  occuredAt?: string;
  endAt?: string;
  classType?: string;
}

export interface SpaceEventItemProps {
  event: SpaceEvent;
  uid: string; // <-- unique, stable key for this row
  extractClass?: (name?: string, desc?: string) => string | null;
  explainClass?: (classStr?: string | null) => string;
  isOpen: boolean;           // <-- make controlled (required)
  onToggle: () => void;      // <-- make controlled (required)
}

function formatDate(dateStr?: string) {
  if (!dateStr) {
    return '';
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return dateStr;
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}-${day}-${year}`;
}

export const SpaceEventItem: React.FC<SpaceEventItemProps> = ({
  event,
  uid,
  extractClass,
  explainClass,
  isOpen,
  onToggle
}) => {
  const flareClass = extractClass
    ? extractClass(event.name, event.description)
    : event.classType;

  return (
    <li className="flare">
      <div className="flare__header">
        <div className="flare__title">
          <div className="flare__name">{event.name || 'Unnamed Event'}</div>
          <div className="flare__meta">
            {event.startAt && event.endAt ? (
              <>
                Event was seen from <strong>{formatDate(event.startAt)}</strong> to <strong>{formatDate(event.endAt)}</strong>
              </>
            ) : (
              <>Timing unknown</>
            )}
            {event.occuredAt && (
              <span>
                {' '}
                &mdash; peaked at <strong>{formatDate(event.occuredAt)}</strong>
              </span>
            )}
          </div>
        </div>
        <button
          className={`flare__toggle ${isOpen ? 'is-open' : ''}`}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`details-${uid}`} // <-- use stable uid
        >
          {isOpen ? 'Hide details ▲' : 'Show details ▼'}
        </button>
      </div>

      {isOpen && (
        <div id={`details-${uid}`} className="flare__details">
          <div className="flare__row">
            <span className="flare__label">Class:</span>
            <span className={`flare__badge ${flareClass ? `badge-${flareClass[0].toUpperCase()}` : ''}`}>
              {flareClass ?? 'Unknown'}
            </span>
          </div>
          {explainClass && <div className="flare__explain">{explainClass(flareClass)}</div>}
          <div className="flare__row flare__row--stack">
            <span className="flare__label">Description:</span>
            <div className="flare__desc">{event.description || 'No description'}</div>
          </div>
        </div>
      )}
    </li>
  );
};
