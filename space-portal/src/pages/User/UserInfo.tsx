import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, type UserProfileDTO } from '../../lib/api';
import './UserInfo.css';

// Lightweight JWT decoder (no crypto validation; client-side display only)
function decodeJwt(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const padded = payload + '==='.slice((payload.length + 3) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function formatUnixTime(ts?: number): string | null {
  if (!ts && ts !== 0) {
    return null;
  }
  const d = new Date(ts * 1000);
  return `${d.toLocaleString()}`;
}

function getStorageMode(): 'session' | 'local' | 'unknown' {
  const key = api.tokenStorageKey;
  try {
    if (sessionStorage.getItem(key)) {
      return 'session';
    }
  } catch {}
  try {
    if (localStorage.getItem(key)) {
      return 'local';
    }
  } catch {}
  return 'unknown';
}

export default function UserInfo() {
  const navigate = useNavigate();
  const token = api.getToken();
  const claims = useMemo(() => (token ? decodeJwt(token) : null), [token]);
  // Storage mode no longer displayed in UI, but kept here if needed for future decisions
  const mode = getStorageMode();
  const [profile, setProfile] = useState<UserProfileDTO | null>(null);
  const [profileError, setProfileError] = useState<string>('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', firstName: '', lastName: '', aboutMe: '' });

  const handleLogout = () => {
    api.clearToken();
    navigate('/login');
  };

  // Heuristic extraction for common claim keys from ASP.NET Core + JWT
  const userIdClaim = (
    claims?.userId ||
    claims?.UserId ||
    claims?.nameid ||
    claims?.sub ||
    claims?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
  ) as string | number | undefined;

  // Load profile if we have a user id from claims
  useEffect(() => {
    const idNum = typeof userIdClaim === 'string' ? Number(userIdClaim) : typeof userIdClaim === 'number' ? userIdClaim : NaN;
    if (!token || !claims || !idNum || Number.isNaN(idNum)) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    setProfileError('');
    api.getUserProfile(idNum)
      .then((p) => { if (!cancelled) { setProfile(p); setForm({
        username: p.username ?? '',
        email: p.email ?? '',
        firstName: p.firstName ?? '',
        lastName: p.lastName ?? '',
        aboutMe: p.aboutMe ?? ''
      }); } })
      .catch((e: any) => { if (!cancelled) { setProfile(null); setProfileError(e?.message || 'Failed to load profile'); } });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // After hooks: render unauthenticated state
  if (!token) {
    return (
      <section>
        <h1>Your account</h1>
        <p>You are not signed in.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" className="btn">Login</Link>
          <Link to="/register" className="btn secondary">Register</Link>
        </div>
      </section>
    );
  }

  // Remaining claim fallbacks for UI only (non-sensitive)
  const displayName = (claims?.displayName || claims?.name || claims?.unique_name) as string | undefined;
  const emailFromClaims = (claims?.email || claims?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']) as string | undefined;

  return (
    <section className="account-page" style={{ maxWidth: 900, margin: '0 auto', padding: '1rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Your account</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn">Edit</button>
          )}
          {editing && (
            <>
              <button
                className="btn"
                disabled={saving}
                onClick={async () => {
                  try {
                    setSaving(true);
                    setProfileError('');
                    const updated = await api.updateMyAccount({
                      username: form.username.trim() || undefined,
                      email: form.email.trim() || undefined,
                      firstName: form.firstName.trim() || undefined,
                      lastName: form.lastName.trim() || undefined,
                      aboutMe: form.aboutMe.trim() || undefined,
                    });
                    // Refresh local profile state from server response
                    setProfile(updated);
                    setForm({
                      username: updated.username ?? '',
                      email: updated.email ?? '',
                      firstName: updated.firstName ?? '',
                      lastName: updated.lastName ?? '',
                      aboutMe: updated.aboutMe ?? '',
                    });
                    setEditing(false);
                  } catch (e: any) {
                    setProfileError(e?.message || 'Failed to save profile');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button className="btn secondary" disabled={saving} onClick={() => {
                // Reset form from last loaded profile and exit editing
                setForm({
                  username: profile?.username ?? displayName ?? '',
                  email: profile?.email ?? emailFromClaims ?? '',
                  firstName: profile?.firstName ?? '',
                  lastName: profile?.lastName ?? '',
                  aboutMe: profile?.aboutMe ?? ''
                });
                setEditing(false);
              }}>Cancel</button>
            </>
          )}
          <button onClick={handleLogout} className="btn danger">Logout</button>
        </div>
      </header>

      <div className="panel" style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Profile</h3>
        {!editing ? (
          <dl style={{ display: 'grid', gridTemplateColumns: '180px 1fr', rowGap: 8 }}>
            <dt>Username</dt>
            <dd>{profile?.username ?? displayName ?? '—'}</dd>

            <dt>Email</dt>
            <dd>{profile?.email ?? emailFromClaims ?? '—'}</dd>

            <dt>First name</dt>
            <dd>{profile?.firstName ?? '—'}</dd>

            <dt>Last name</dt>
            <dd>{profile?.lastName ?? '—'}</dd>

            <dt>About me</dt>
            <dd style={{ whiteSpace: 'pre-wrap' }}>{profile?.aboutMe ?? '—'}</dd>
          </dl>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); }}>
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', rowGap: 12, alignItems: 'center' }}>
              <label>Username</label>
              <input className="input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} maxLength={100} />

              <label>Email</label>
              <input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} maxLength={200} />

              <label>First name</label>
              <input className="input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} maxLength={100} />

              <label>Last name</label>
              <input className="input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} maxLength={100} />

              <label>About me</label>
              <textarea className="input" rows={4} value={form.aboutMe} onChange={e => setForm(f => ({ ...f, aboutMe: e.target.value }))} maxLength={1000} />
            </div>
          </form>
        )}

        {profileError && (
          <div className="admin-import__error" style={{ marginTop: 8, textAlign: 'left' }}>Error: {profileError}</div>
        )}
      </div>
    </section>
  );
}
