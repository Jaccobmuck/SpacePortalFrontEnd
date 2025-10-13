import React, { useState, useEffect } from 'react';
import PanelBox from '../../components/PanelBox';
import './Admin.css';

export default function Admin() {
  // Users fetched from backend
  const [users, setUsers] = useState<{ userId: number; displayName: string; roleId: number }[]>([]);
  useEffect(() => {
    fetch('https://localhost:7178/api/User/GetUsers')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => setUsers([]));
  }, []);

  // Import panel state
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    capped?: boolean;
    totalAvailable?: number;
    range?: { start?: string; end?: string };
    note?: string;
    message?: string;
  } | null>(null);
  const [error, setError] = useState('');

  // Dummy import handler for demo
  function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    // Format date as yyyy-mm-dd for backend
    function toYMD(dateStr: string) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }

    const params = [];
    const startYMD = toYMD(start);
    const endYMD = toYMD(end);
    if (startYMD) params.push(`start=${encodeURIComponent(startYMD)}`);
    if (endYMD) params.push(`end=${encodeURIComponent(endYMD)}`);
    const query = params.length ? `?${params.join('&')}` : '';

    fetch(`https://localhost:7178/api/import/donki/flares${query}`, {
      method: 'POST'
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Import failed');
        } else {
          setResult(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Network error');
        setLoading(false);
      });
  }

  return (
    <>
      <div style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 600, marginBottom: '2rem' }}>
        Welcome to the Admin Portal
      </div>
      <div className="admin-import" style={{ display: 'flex', gap: '3rem', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'nowrap' }}>
        <PanelBox title="User Management">
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {users.length === 0 && <li>No users found.</li>}
            {users.map(user => (
              <li key={user.userId} style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>
                <strong>{user.displayName}</strong> &mdash; {(() => {
                  switch (user.roleId) {
                    case 1: return 'Admin';
                    case 2: return 'User';
                    case 3: return 'Guest';
                    default: return 'Unknown';
                  }
                })()}
              </li>
            ))}
          </ul>
        </PanelBox>
        <PanelBox title="Import Solar Flare Data (DONKI)">
          <form onSubmit={handleImport} className="admin-import__form">
            <div>
              <label>
                Start Date (mm-dd-yyyy):
                <input type="date" value={start} onChange={e => setStart(e.target.value)} />
              </label>
            </div>
            <div>
              <label>
                End Date (mm-dd-yyyy):
                <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
              </label>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Importing...' : 'Import Flares'}
            </button>
          </form>
          {error && <div className="admin-import__error">Error: {error}</div>}
          {result && (
            <div className="admin-import__result">
              <h3>Import Complete</h3>
              <div>Imported: {result.imported}</div>
              {result.capped && (
                <div style={{ color: 'orange', fontWeight: 600 }}>
                  Import capped at {result.totalAvailable} records (max {result.imported} imported)
                </div>
              )}
              <div>Total Available: {result.totalAvailable}</div>
              <div>
                Date Range: {result.range?.start?.substring(0, 10)} to {result.range?.end?.substring(0, 10)}
              </div>
              {result.note && <div>Note: {result.note}</div>}
              {result.message && <div>Message: {result.message}</div>}
            </div>
          )}
        </PanelBox>
      </div>
    </>
  );
}