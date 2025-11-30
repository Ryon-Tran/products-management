const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function request(path: string, opts: RequestInit = {}) {
  const headers: Record<string,string> = { 'Content-Type': 'application/json', ...(opts.headers || {}) as any };
  // attach token if present
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch (_) {}

  const res = await fetch(BASE + path, { ...opts, headers });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = data?.error || data?.message || res.statusText || 'Request failed';
    const e: any = new Error(err);
    e.status = res.status;
    e.data = data;
    throw e;
  }
  return data;
}

export default request;
