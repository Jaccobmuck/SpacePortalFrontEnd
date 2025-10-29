import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api';

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
  const mode = getStorageMode();

  const handleLogout = () => {
    api.clearToken();
    navigate('/login');
  };

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

  const exp = claims?.exp as number | undefined;
  const iat = claims?.iat as number | undefined;
  const nowSec = Math.floor(Date.now() / 1000);
  const secondsLeft = typeof exp === 'number' ? Math.max(0, exp - nowSec) : undefined;

  // Heuristic extraction for common claim keys from ASP.NET Core + JWT
  const displayName = (claims?.displayName || claims?.name || claims?.unique_name) as string | undefined;
  const role = (claims?.role || claims?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) as string | undefined;
  const userId = (claims?.userId || claims?.nameid || claims?.sub) as string | number | undefined;

  return (
    <section>
      <h1>Your account</h1>
      <p>Signed in using <strong>{mode === 'session' ? 'Session' : mode === 'local' ? 'Persistent' : 'Unknown'}</strong> storage.</p>

      <div className="panel" style={{ padding: 16, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Profile</h2>
        <dl style={{ display: 'grid', gridTemplateColumns: '180px 1fr', rowGap: 8 }}>
          <dt>Display name</dt>
          <dd>{displayName ?? '—'}</dd>

          <dt>Role</dt>
          <dd>{role ?? '—'}</dd>

          <dt>User ID</dt>
          <dd>{userId ?? '—'}</dd>

          <dt>Issued at</dt>
          <dd>{formatUnixTime(iat) ?? '—'}</dd>

          <dt>Expires</dt>
          <dd>
            {formatUnixTime(exp) ?? '—'}
            {typeof secondsLeft === 'number' && (
              <span style={{ marginLeft: 8, opacity: 0.8 }}>
                ({Math.ceil(secondsLeft / 60)} min left)
              </span>
            )}
          </dd>
        </dl>

        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <button onClick={handleLogout} className="btn danger">Logout</button>
          <Link to="/admin" className="btn secondary">Admin</Link>
        </div>
      </div>

      <details>
        <summary>View raw token claims</summary>
        <pre style={{ overflowX: 'auto', background: '#1113', padding: 12, borderRadius: 6 }}>
{JSON.stringify(claims, null, 2)}
        </pre>
      </details>
    </section>
  );
}
