type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const BASE =
  process.env.REACT_APP_API_BASE_URL ||
  'https://localhost:7027'; // CRA uses REACT_APP_*

async function request<T>(
  path: string,
  method: HttpMethod = 'GET',
  body?: unknown
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}` // add when JWT is in place
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const msg = await safeError(res);
    throw new Error(msg || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function safeError(res: Response): Promise<string | null> {
  try {
    const data = await res.json();
    return (data as any)?.message ?? null;
  } catch {
    return null;
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path, 'GET'),
  post: <T>(path: string, body?: unknown) => request<T>(path, 'POST', body),
  put:  <T>(path: string, body?: unknown) => request<T>(path, 'PUT', body),
  del:  <T>(path: string) => request<T>(path, 'DELETE'),
};