// src/lib/api.ts
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const BASE = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7178';

async function request<T>(path: string, method: HttpMethod = 'GET', body?: unknown): Promise<T> {
  const url = `${BASE}${path}`;
  if (body) console.debug(`[API ${method}] ${url} BODY:`, body);

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const msg = await extractErrorMessage(res);
    console.debug(`[API ERROR ${res.status}]`, msg);
    throw new Error(msg || `Request failed: ${res.status} ${res.statusText}`);
  }

  try {
    const data = (await res.json()) as T;
    console.debug(`[API OK ${res.status}]`, data);
    return data;
  } catch {
    console.debug(`[API OK ${res.status}] (no content)`);
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

export const api = {
  get:  <T>(path: string) => request<T>(path, 'GET'),
  post: <T>(path: string, body?: unknown) => request<T>(path, 'POST', body),
  put:  <T>(path: string, body?: unknown) => request<T>(path, 'PUT', body),
  del:  <T>(path: string) => request<T>(path, 'DELETE'),
};
