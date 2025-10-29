import React from 'react';
import { api } from '../lib/api';

// Minimal JWT decoder for client-side inspection
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

function hasRole(claims: Record<string, any> | null, role: string): boolean {
  if (!claims) {
    return false;
  }
  // Common role claim keys from ASP.NET / JWT
  const raw = claims.role
    || claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    || claims['roles']
    || null;

  if (!raw) {
    return false;
  }
  if (Array.isArray(raw)) {
    return raw.map(String).some(r => r.toLowerCase() === role.toLowerCase());
  }
  const asStr = String(raw);
  // Support comma/space separated role lists just in case
  return asStr.split(/[,\s]+/).some(r => r.toLowerCase() === role.toLowerCase());
}

const FORBIDDEN_IMG = 'https://t3.ftcdn.net/jpg/05/31/38/04/360_F_531380409_1yYjP48c1jEWVuoN3O0344ePNAFTGMoK.jpg';

function Forbidden() {
  return (
    <section style={{ textAlign: 'center' }}>
      <h1>403 — Forbidden</h1>
      <p>You do not have permission to view this page.</p>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <img
          src={FORBIDDEN_IMG}
          alt="Forbidden — Access denied"
          style={{ maxWidth: '100%', width: 420, height: 'auto', borderRadius: 8 }}
        />
      </div>
    </section>
  );
}

export default function RequireAdmin({ children, requiredRole = 'Admin' }: { children: React.ReactNode; requiredRole?: string }) {
  const token = api.getToken();
  const claims = token ? decodeJwt(token) : null;
  const ok = hasRole(claims, requiredRole);
  if (!ok) {
    return <Forbidden />;
  }
  return <>{children}</>;
}
