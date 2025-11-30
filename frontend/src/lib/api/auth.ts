import { request } from './request';

export const login = async (email: string, password: string) => {
  const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  // persist token and fetch role to keep header in sync
  try {
    if (typeof window !== 'undefined' && data?.token) {
      localStorage.setItem('token', data.token);
      // If backend included user info in the login response, persist it immediately
      // Expected shapes: { token, user, roles } or { token, user: { ... }, roles: [...] }
      try {
        if (data.user) {
          try { localStorage.setItem('pm_user', JSON.stringify(data.user || {})); } catch (_) {}
        }
        if (data.roles && Array.isArray(data.roles) && data.roles.length > 0) {
          try { localStorage.setItem('pm_role', data.roles[0]); } catch (_) {}
        }
      } catch (_) {}

      // If we didn't get user info from login response, attempt to fetch /auth/me
      if (!data.user) {
        try {
          const me = await request('/auth/me', { method: 'GET' });
          const role = (me?.roles && me.roles.length > 0) ? me.roles[0] : null;
          if (role) localStorage.setItem('pm_role', role);
          try { localStorage.setItem('pm_user', JSON.stringify(me || {})); } catch (_) {}
        } catch (e) {
          console.warn('failed to fetch me after login', e);
        }
      }
      try { window.dispatchEvent(new Event('pm.auth')); } catch (_) {}
    }
  } catch (e) {
    console.warn('error persisting login token', e);
  }
  return data;
};

export const register = async (payload: { name: string; email: string; password: string }) => {
  return request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
};

export const me = async () => {
  return request('/auth/me', { method: 'GET' });
};

export default { login, register, me };
