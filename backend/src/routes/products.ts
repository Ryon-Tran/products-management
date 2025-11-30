import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

type Product = {
  id?: number;
  name: string;
  description?: string;
  price?: number;
};

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, price, image_url, category_id } = req.body as any;
    const result = await query(
      'INSERT INTO products (name, description, price, image_url, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, image_url, category_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const sort = req.query.sort as string | undefined; // e.g. price_asc, price_desc, newest

    // Build dynamic WHERE clauses
    const clauses: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (search) {
      clauses.push(`(name ILIKE $${idx} OR description ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    if (category) {
      clauses.push(`category_id = $${idx}`);
      params.push(Number(category));
      idx++;
    }

    if (minPrice !== undefined && !isNaN(minPrice)) {
      clauses.push(`price >= $${idx}`);
      params.push(minPrice);
      idx++;
    }

    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      clauses.push(`price <= $${idx}`);
      params.push(maxPrice);
      idx++;
    }

    let sql = 'SELECT * FROM products';
    if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');

    // Sorting
    if (sort === 'price_asc') sql += ' ORDER BY price ASC';
    else if (sort === 'price_desc') sql += ' ORDER BY price DESC';
    else sql += ' ORDER BY id DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, image_url, category_id } = req.body as any;
    const result = await query(
      'UPDATE products SET name=$1, description=$2, price=$3, image_url=$4, category_id=$5 WHERE id=$6 RETURNING *',
      [name, description, price, image_url, category_id || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
