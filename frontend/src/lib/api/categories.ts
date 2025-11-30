import { request } from './request';

export const list = async () => request('/categories', { method: 'GET' });
export const create = async (name: string) => request('/categories', { method: 'POST', body: JSON.stringify({ name }) });

export default { list, create };
