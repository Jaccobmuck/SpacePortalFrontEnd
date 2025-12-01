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
  username: string; // maps to Username on backend (case-insensitive JSON)
  password: string; // maps to Password
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
  username: string;
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

export interface ChangeUserRoleRequest {
  roleId: number;
}

// Astronomy Picture of the Day (APOD) DTO
// Backend likely returns PascalCase keys (Date, Title, Explanation, Url, HdUrl, MediaType, Copyright)
// Normalize to camelCase for frontend consumption.
export interface ApodDto {
  date: string; // ISO yyyy-MM-dd
  title: string;
  explanation?: string;
  url?: string; // image or video URL (if mediaType === 'image' or 'video')
  hdUrl?: string;
  mediaType?: string; // 'image' | 'video' | etc.
  copyright?: string;
}

// User profile DTOs
// Raw response from backend (camel-cased by ASP.NET Core): displayName, firstName, lastName, aboutMe, email
interface RawUserProfileResponse {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  aboutMe?: string;
  email?: string;
}

// Normalized shape used by the app: map displayName -> username
export interface UserProfileDTO {
  username?: string;
  firstName?: string;
  lastName?: string;
  aboutMe?: string;
  email?: string;
}

export interface UpdateUserProfileRequest {
  // Use camelCase keys; server JSON is case-insensitive
  username?: string;   // maps to DisplayName
  firstName?: string;
  lastName?: string;
  aboutMe?: string;
  email?: string;
}

function authHeader() {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, method: HttpMethod = 'GET', body?: unknown, skipAuth = false): Promise<T> {
  const url = `${BASE}${path}`;
  // Avoid logging request bodies to prevent accidental exposure of credentials or PII

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
    // Log minimally without payloads
    console.debug(`[API ERROR ${res.status}] ${url}${msg ? ` :: ${msg}` : ''}`);
    throw new Error(msg || `Request failed: ${res.status} ${res.statusText}`);
  }

  // Some endpoints may return no body
  const text = await res.text();
  if (!text) {
    // No content
    return {} as T;
  }
  try {
    const data = JSON.parse(text) as T;
    // Do not log response bodies (may contain sensitive data like tokens)
    return data;
  } catch {
    // Non-JSON response
    return {} as T;
  }
}

async function extractErrorMessage(res: Response): Promise<string | null> {
  // Try JSON first (ProblemDetails or custom object)
  try {
    const data = await res.clone().json();
    if (data && typeof data === 'object') {
      return (data as any).detail || (data as any).title || (data as any).message || (data as any).error || null;
    }
    // If server returned a JSON string (unlikely), surface it
    if (typeof data === 'string') return data;
  } catch {
    // fall through
  }
  // Fallback to raw text (e.g., Conflict("Display name already taken."))
  try {
    const txt = await res.clone().text();
    return txt || null;
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
  // Notify app of auth change (same-tab updates)
  try {
    const isLoggedIn = !!getStoredToken();
    window.dispatchEvent(new CustomEvent('auth:changed', { detail: { isLoggedIn } }));
  } catch {
    // ignore (SSR or environment without window)
  }
}

function clearToken() {
  try { sessionStorage.removeItem(TOKEN_STORAGE_KEY); } catch {}
  try { localStorage.removeItem(TOKEN_STORAGE_KEY); } catch {}
  // Notify app of auth change
  try {
    window.dispatchEvent(new CustomEvent('auth:changed', { detail: { isLoggedIn: false } }));
  } catch {}
}

async function login(credentials: LoginRequestDTO): Promise<LoginResponseDTO> {
  // Backend currently expects DisplayName + Password
  const payload = {
    DisplayName: credentials.username,
    Password: credentials.password,
  };
  const raw = await request<any>('/api/Auth/login', 'POST', payload, true);
  // Normalize response casing to our DTO
  const u = raw?.user ?? {};
  const normalized: LoginResponseDTO = {
    token: raw?.token,
    user: {
      userId: u.userId ?? u.UserId,
      displayName: u.displayName ?? u.DisplayName,
      role: u.role ?? u.Role,
    },
  };
  return normalized;
}

async function register(payload: RegisterRequestDTO): Promise<RegisterResponseDTO> {
  // Backend currently expects DisplayName + Password
  const body = { DisplayName: payload.username, Password: payload.password };
  // Response might be a string; normalize
  try {
    const resp = await request<any>('/api/Auth/register', 'POST', body, true);
    if (typeof resp === 'string') return { message: resp };
    return resp as RegisterResponseDTO;
  } catch (e: any) {
    throw e;
  }
}

// ---- APOD helpers ----
function normalizeApod(raw: any): ApodDto {
  if (!raw || typeof raw !== 'object') {
    return { date: '', title: '' };
  }
  return {
    date: raw.date || raw.Date || '',
    title: raw.title || raw.Title || '',
    explanation: raw.explanation || raw.Explanation,
    url: raw.url || raw.Url,
    hdUrl: raw.hdUrl || raw.HdUrl || raw.hdurl || raw.HDUrl,
    mediaType: raw.mediaType || raw.MediaType,
    copyright: raw.copyright || raw.Copyright,
  };
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
    // New backend route: GET /api/users
    return request<AdminUserDTO[]>('/api/users', 'GET');
  },
  async changeUserRole(userId: number, roleId: number) {
    // New backend route: PUT /api/users/{id}/role with body { roleId }
    const body: ChangeUserRoleRequest = { roleId };
    return request<void>(`/api/users/${encodeURIComponent(String(userId))}/role`, 'PUT', body);
  },
  async importDonkiFlares(params?: { start?: string; end?: string }) {
    const q: string[] = [];
    if (params?.start) q.push(`start=${encodeURIComponent(params.start)}`);
    if (params?.end) q.push(`end=${encodeURIComponent(params.end)}`);
    const qs = q.length ? `?${q.join('&')}` : '';
    // POST with no body
    return request<DonkiImportResult>(`/api/import/donki/flares${qs}`, 'POST');
  },
  // Profiles
  async getUserProfile(id: number): Promise<UserProfileDTO> {
    const raw = await request<RawUserProfileResponse>(`/api/users/${encodeURIComponent(String(id))}/profile`, 'GET');
    return {
      username: raw.displayName,
      firstName: raw.firstName,
      lastName: raw.lastName,
      aboutMe: raw.aboutMe,
      email: raw.email,
    };
  },
  async updateMyAccount(payload: UpdateUserProfileRequest): Promise<UserProfileDTO> {
    const body: any = {
      DisplayName: payload.username,
      FirstName: payload.firstName,
      LastName: payload.lastName,
      AboutMe: payload.aboutMe,
      Email: payload.email,
    };
    const raw = await request<RawUserProfileResponse>(`/api/users/me`, 'PUT', body);
    return {
      username: raw.displayName,
      firstName: raw.firstName,
      lastName: raw.lastName,
      aboutMe: raw.aboutMe,
      email: raw.email,
    };
  },
  async updateUserProfile(id: number, payload: UpdateUserProfileRequest): Promise<void> {
    // Convert to server-expected keys (DisplayName) while accepting camelCase in UI
    const body: any = {
      DisplayName: payload.username,
      FirstName: payload.firstName,
      LastName: payload.lastName,
      AboutMe: payload.aboutMe,
      Email: payload.email,
    };
    return request<void>(`/api/users/${encodeURIComponent(String(id))}/profile`, 'PUT', body);
  },
  // Optional convenience helpers for new RESTful users API
  async getUserById(id: number) {
    return request<AdminUserDTO>(`/api/users/${encodeURIComponent(String(id))}`, 'GET');
  },
  async createUser(payload: { displayName: string; email: string; roleId?: number }) {
    return request<AdminUserDTO>(`/api/users`, 'POST', payload);
  },
  async updateUser(id: number, payload: { displayName?: string; email?: string }) {
    return request<void>(`/api/users/${encodeURIComponent(String(id))}`, 'PUT', payload);
  },
  async deleteUser(id: number) {
    return request<void>(`/api/users/${encodeURIComponent(String(id))}`, 'DELETE');
  },
  // APOD endpoints
  async getApodToday(): Promise<ApodDto> {
    const raw = await request<any>('/api/apod/today', 'GET');
    return normalizeApod(raw);
  },
  async getApodByDate(date: string): Promise<ApodDto> {
    // Expect date format yyyy-MM-dd
    const raw = await request<any>(`/api/apod/${encodeURIComponent(date)}`, 'GET');
    return normalizeApod(raw);
  },
  async getApodRecent(limit = 30): Promise<ApodDto[]> {
    const raw = await request<any[]>(`/api/apod/recent?limit=${encodeURIComponent(String(limit))}`, 'GET');
    return Array.isArray(raw) ? raw.map(normalizeApod) : [];
  },
};

export type { LoginResponseDTO as LoginResponse, RegisterRequestDTO as RegisterRequest, RegisterResponseDTO as RegisterResponse };
// Interfaces above are already exported; no need to re-export types here.
