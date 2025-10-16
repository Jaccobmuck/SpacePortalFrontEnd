// Admin page: user list and DONKI flare import tools
import React, { useState, useEffect } from 'react';
import PanelBox from '../../components/PanelBox';
import './Admin.css';
import { api, type AdminUserDTO, type DonkiImportResult } from '../../lib/api';

export default function Admin() {
  // Users fetched from backend
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  useEffect(() => {
    api.getUsers()
      .then((res) => {
        setUsers(res);
      })
      .catch(() => {
        setUsers([]);
      });
  }, []);

  // Import panel state
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DonkiImportResult | null>(null);
  const [error, setError] = useState('');

  // Import handler
  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    // Format date as yyyy-mm-dd for backend
    function toYMD(dateStr: string) {
      if (!dateStr) {
        return '';
      }
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return '';
      }
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }

    const params: { start?: string; end?: string } = {};
    const startYMD = toYMD(start);
    const endYMD = toYMD(end);
    if (startYMD) {
      params.start = startYMD;
    }
    if (endYMD) {
      params.end = endYMD;
    }

    try {
      const data = await api.importDonkiFlares(params);
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
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
              {typeof result.totalAvailable === 'number' && (
                <div>Total Available: {result.totalAvailable}</div>
              )}
              {(result.range?.start || result.range?.end) && (
                <div>
                  Date Range: {result.range?.start?.substring(0, 10)} to {result.range?.end?.substring(0, 10)}
                </div>
              )}
              {result.note && <div>Note: {result.note}</div>}
              {result.message && <div>Message: {result.message}</div>}
            </div>
          )}
        </PanelBox>
      </div>
    </>
  );
}