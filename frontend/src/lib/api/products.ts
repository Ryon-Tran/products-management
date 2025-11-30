import { request } from './request';

export type ProductFilters = {
	search?: string;
	category?: number | string;
	minPrice?: number | string;
	maxPrice?: number | string;
	sort?: 'price_asc' | 'price_desc' | 'newest' | string;
};

export const list = async (filters?: ProductFilters) => {
	const params = new URLSearchParams();
	if (filters) {
		if (filters.search) params.set('search', String(filters.search));
		if (filters.category) params.set('category', String(filters.category));
		if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
		if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
		if (filters.sort) params.set('sort', String(filters.sort));
	}
	const query = params.toString();
	return request('/products' + (query ? `?${query}` : ''), { method: 'GET' });
};

export const get = async (id: number) => request(`/products/${id}`, { method: 'GET' });

export const create = async (body: { name: string; description?: string; price?: number; category_id?: number; image_url?: string }) =>
	request(`/products`, { method: 'POST', body: JSON.stringify(body) });

export const update = async (id: number, body: { name: string; description?: string; price?: number; category_id?: number; image_url?: string }) =>
	request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const remove = async (id: number) => request(`/products/${id}`, { method: 'DELETE' });

export default { list, get };
