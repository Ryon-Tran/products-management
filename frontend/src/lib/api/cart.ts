import { request } from './request';

export const get = async () => request('/cart', { method: 'GET' });
export const addOrUpdateItem = async (item: { product_id: number; quantity: number }) => request('/cart/items', { method: 'POST', body: JSON.stringify(item) });
export const removeItem = async (id: number) => request(`/cart/items/${id}`, { method: 'DELETE' });

export default { get, addOrUpdateItem, removeItem };
