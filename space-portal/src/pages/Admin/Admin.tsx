// Admin page: user list and DONKI flare import tools
import React, { useState, useEffect } from 'react';
import PanelBox from '../../components/PanelBox';
import './Admin.css';
import { api, type AdminUserDTO, type DonkiImportResult } from '../../lib/api';

export default function Admin() {
  // Users fetched from backend
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<AdminUserDTO | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newRoleId, setNewRoleId] = useState<number | null>(null);
  const [savingRole, setSavingRole] = useState(false);
  const [saveError, setSaveError] = useState('');
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <input
              className="input"
              placeholder="Search by name..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ maxWidth: 280 }}
            />
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {users.length === 0 && <li>No users found.</li>}
            {users
              .filter(u => !filter || u.displayName.toLowerCase().includes(filter.toLowerCase()))
              .map(user => (
                <li key={user.userId} style={{ marginBottom: '0.75rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <strong>{user.displayName}</strong>
                    <span style={{ opacity: 0.7, marginLeft: 8 }}>#{user.userId}</span>
                    <span style={{ marginLeft: 10, fontSize: '0.95rem', padding: '2px 8px', border: '1px solid var(--border)', borderRadius: 999 }}>{roleLabel(user.roleId)}</span>
                  </div>
                  <div>
                    <button className="btn secondary" onClick={() => { setSelected(user); setNewRoleId(user.roleId); setSaveError(''); setDrawerOpen(true); }}>Manage</button>
                  </div>
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

      {/* Right-side drawer for selected user */}
      {selected && (
        <>
          <div
            className={`admin-user-overlay ${drawerOpen ? 'show' : ''}`}
            onClick={() => setDrawerOpen(false)}
          />
          <aside className={`admin-user-drawer ${drawerOpen ? 'open' : ''}`}>
            <header className="admin-user-drawer__header">
              <h3 style={{ margin: 0 }}>Manage User</h3>
              <button className="icon-btn" aria-label="Close" onClick={() => setDrawerOpen(false)}>×</button>
            </header>
            <div className="admin-user-drawer__body">
              <dl className="admin-user-drawer__meta">
                <dt>Display Name</dt>
                <dd>{selected.displayName}</dd>
                <dt>User ID</dt>
                <dd>
                  {selected.userId}
                  <button
                    className="btn secondary"
                    style={{ marginLeft: 8, padding: '4px 8px' }}
                    onClick={() => navigator.clipboard?.writeText(String(selected.userId))}
                  >
                    Copy ID
                  </button>
                </dd>
                <dt>Role</dt>
                <dd>
                  <select
                    className="input"
                    value={newRoleId ?? selected.roleId}
                    onChange={(e) => setNewRoleId(Number(e.target.value))}
                    style={{ maxWidth: 220 }}
                  >
                    <option value={1}>Guest</option>
                    <option value={2}>User</option>
                    <option value={3}>Admin</option>
                  </select>
                </dd>
              </dl>

              {saveError && (
                <div className="admin-import__error" style={{ textAlign: 'left' }}>Error: {saveError}</div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  className="btn"
                  disabled={savingRole || newRoleId === null || newRoleId === selected.roleId}
                  onClick={async () => {
                    if (newRoleId === null) return;
                    try {
                      setSavingRole(true);
                      setSaveError('');
                      await api.changeUserRole(selected.userId, newRoleId);
                      setUsers(prev => prev.map(u => u.userId === selected.userId ? { ...u, roleId: newRoleId } : u));
                      setSelected(prev => (prev ? { ...prev, roleId: newRoleId } : prev));
                    } catch (e: any) {
                      setSaveError(e?.message || 'Failed to change role');
                    } finally {
                      setSavingRole(false);
                    }
                  }}
                >
                  {savingRole ? 'Saving…' : 'Save Changes'}
                </button>
                <button className="btn secondary" onClick={() => setDrawerOpen(false)}>Close</button>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

function roleLabel(roleId: number): string {
  // Provided mapping: 1 -> Guest, 2 -> User, 3 -> Admin
  switch (roleId) {
    case 1: return 'Guest';
    case 2: return 'User';
    case 3: return 'Admin';
    default: return 'Unknown';
  }
}