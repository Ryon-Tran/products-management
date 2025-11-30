export const updateStatus = async (id: number, status: string) =>
	request(`/orders/admin/${id}/status`, {
		method: 'PUT',
		body: JSON.stringify({ status })
	});
import { request } from './request';

export const create = async (payload: any) => request('/orders', { method: 'POST', body: JSON.stringify(payload) });
export const list = async () => request('/orders', { method: 'GET' });
export const get = async (id: number) => request(`/orders/${id}`, { method: 'GET' });
export const listAdmin = async () => request('/orders/admin', { method: 'GET' });

export default { create, list, get };
