// src/lib/api.ts
// Generic API helper with auth token support and typed endpoints.

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const BASE = (process.env.REACT_APP_API_BASE_URL || 'https://localhost:7178').replace(/\/$/, '');

// ---- Auth token handling ----
const TOKEN_STORAGE_KEY = 'spaceportal.jwt';

function getStoredToken(): string | null {
  try {
    const s = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (s) {
      return s;
    }
  } catch {
    /* ignore */
  }
  try {
    const l = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (l) {
      return l;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export interface LoginRequestDTO {
  displayName: string; // maps to DisplayName on backend (case-insensitive JSON)
  password: string;    // maps to Password
}

export interface LoginResponseDTO {
  token: string;
  user: {
    userId: number;
    displayName: string;
    role: string;
  };
}

// Register (backend expects DisplayName + Password; role optional/not used currently)
export interface RegisterRequestDTO {
  displayName: string;
  password: string;
}

export interface RegisterResponseDTO {
  // Backend currently returns a plain string message; allow flexibility
  message?: string;
  // If backend just returns text, we'll surface it as message.
}

// DONKI import result (backend: DONKIImportController.ImportFlares)
export interface DonkiImportResult {
  imported: number;
  capped?: boolean;
  totalAvailable?: number;
  range?: { start?: string; end?: string };
  note?: string;
  message?: string;
}

// Minimal user shape used by Admin page
export interface AdminUserDTO {
  userId: number;
  displayName: string;
  roleId: number;
}

function authHeader() {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, method: HttpMethod = 'GET', body?: unknown, skipAuth = false): Promise<T> {
  const url = `${BASE}${path}`;
  if (body) console.debug(`[API ${method}] ${url} BODY:`, body);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (!skipAuth) {
    const t = getStoredToken();
    if (t) {
      headers['Authorization'] = `Bearer ${t}`;
    }
  }

  const res = await fetch(url, {
    method,
    headers: headers as HeadersInit,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const msg = await extractErrorMessage(res);
    console.debug(`[API ERROR ${res.status}] ${url}`, msg);
    throw new Error(msg || `Request failed: ${res.status} ${res.statusText}`);
  }

  // Some endpoints may return no body
  const text = await res.text();
  if (!text) {
    console.debug(`[API OK ${res.status}] ${url} (no content)`);
    return {} as T;
  }
  try {
    const data = JSON.parse(text) as T;
    console.debug(`[API OK ${res.status}] ${url}`, data);
    return data;
  } catch {
    console.debug(`[API OK ${res.status}] ${url} (non-JSON)`);
    return {} as T;
  }
}

async function extractErrorMessage(res: Response): Promise<string | null> {
  try {
    const data = await res.json();
    return data?.detail || data?.title || data?.message || data?.error || null;
  } catch {
    return null;
  }
}

function setToken(token: string | null) {
  // Back-compat helper: default to localStorage only
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {}
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {}
  if (token) {
    try {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {}
  }
}

// Preferred helpers for token management
function setTokenWithMode(token: string | null, opts?: { persist?: 'session' | 'local' }) {
  const persist = opts?.persist ?? 'session';
  try { sessionStorage.removeItem(TOKEN_STORAGE_KEY); } catch {}
  try { localStorage.removeItem(TOKEN_STORAGE_KEY); } catch {}
  if (token) {
    if (persist === 'session') {
      try { sessionStorage.setItem(TOKEN_STORAGE_KEY, token); } catch {}
    } else {
      try { localStorage.setItem(TOKEN_STORAGE_KEY, token); } catch {}
    }
  }
}

function clearToken() {
  try { sessionStorage.removeItem(TOKEN_STORAGE_KEY); } catch {}
  try { localStorage.removeItem(TOKEN_STORAGE_KEY); } catch {}
}

async function login(credentials: LoginRequestDTO): Promise<LoginResponseDTO> {
  // Backend expects PascalCase properties (DisplayName, Password) but default JSON serializer is case-insensitive
  const payload = {
    DisplayName: credentials.displayName,
    Password: credentials.password,
  };
  const resp = await request<LoginResponseDTO>('/api/Auth/login', 'POST', payload, true);
  return resp;
}

async function register(payload: RegisterRequestDTO): Promise<RegisterResponseDTO> {
  const body = { DisplayName: payload.displayName, Password: payload.password };
  // Response might be a string; normalize
  try {
    const resp = await request<any>('/api/Auth/register', 'POST', body, true);
    if (typeof resp === 'string') return { message: resp };
    return resp as RegisterResponseDTO;
  } catch (e: any) {
    throw e;
  }
}

export const api = {
  baseUrl: BASE,
  get:  <T>(path: string) => request<T>(path, 'GET'),
  post: <T>(path: string, body?: unknown) => request<T>(path, 'POST', body),
  put:  <T>(path: string, body?: unknown) => request<T>(path, 'PUT', body),
  del:  <T>(path: string) => request<T>(path, 'DELETE'),
  // Auth helpers
  login,
  register,
  setToken: setTokenWithMode,
  getToken: getStoredToken,
  clearToken,
  tokenStorageKey: TOKEN_STORAGE_KEY,
  // Admin helpers
  async getUsers() {
    return request<AdminUserDTO[]>('/api/User/GetUsers', 'GET');
  },
  async importDonkiFlares(params?: { start?: string; end?: string }) {
    const q: string[] = [];
    if (params?.start) q.push(`start=${encodeURIComponent(params.start)}`);
    if (params?.end) q.push(`end=${encodeURIComponent(params.end)}`);
    const qs = q.length ? `?${q.join('&')}` : '';
    // POST with no body
    return request<DonkiImportResult>(`/api/import/donki/flares${qs}`, 'POST');
  },
};

export type { LoginResponseDTO as LoginResponse, RegisterRequestDTO as RegisterRequest, RegisterResponseDTO as RegisterResponse };
// Interfaces above are already exported; no need to re-export types here.
