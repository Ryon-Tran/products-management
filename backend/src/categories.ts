import { Request, Response } from 'express';
import { query } from './db';

export async function listCategories(_req: Request, res: Response) {
  try {
    const r = await query('SELECT * FROM categories ORDER BY name');
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') return res.status(400).json({ error: 'Missing or invalid name' });
    const r = await query('INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING *', [name]);
    res.status(201).json(r.rows[0]);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create category' });
  }
}
