import { request } from './request';

export const create = async (payload: any) => request('/orders', { method: 'POST', body: JSON.stringify(payload) });
export const list = async () => request('/orders', { method: 'GET' });
export const get = async (id: number) => request(`/orders/${id}`, { method: 'GET' });

export default { create, list, get };
