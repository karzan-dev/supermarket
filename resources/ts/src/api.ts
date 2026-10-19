export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  token?: string;
  user?: unknown;
  roles?: unknown[];
  permissions?: unknown[];
  errors?: Record<string, string[]>;
}

export async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');

  const token = localStorage.getItem('supermarket.token');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  return fetch(url, { ...init, headers });
}

export async function apiRequest<T>(url: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');

  const token = localStorage.getItem('supermarket.token');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(url, { ...init, headers });
  const payload = await response.json().catch(() => ({})) as ApiResponse<T>;
  if (!response.ok || payload.success === false) {
    const validationMessage = Object.values(payload.errors ?? {}).flat()[0];
    throw new Error(validationMessage || payload.message || `Request failed (${response.status})`);
  }
  return payload;
}

/** The message to show for a failed API response: first validation error, else the server's message, else the fallback. */
export function apiErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload !== 'object' || payload === null) return fallback;
  const { errors, message } = payload as Pick<ApiResponse<unknown>, 'errors' | 'message'>;
  return Object.values(errors ?? {}).flat()[0] || message || fallback;
}

export function jsonBody(value: unknown): string {
  return JSON.stringify(value);
}