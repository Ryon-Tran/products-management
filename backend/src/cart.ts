import { Request, Response } from 'express';
import { query } from './db';

// Add or update cart item
export async function addOrUpdateCartItem(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { product_id, quantity } = req.body;
    if (!product_id || !quantity) return res.status(400).json({ error: 'Missing fields' });

    // ensure cart exists
    let cart = await query('SELECT * FROM carts WHERE user_id = $1', [user.id]);
    if (cart.rows.length === 0) {
      const r = await query('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [user.id]);
      cart = r;
    }
    const cartId = cart.rows[0].id;

    // upsert cart item
    await query(
      `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity`,
      [cartId, product_id, quantity]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update cart' });
  }
}

export async function getCart(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const cartRes = await query('SELECT * FROM carts WHERE user_id = $1', [user.id]);
    if (cartRes.rows.length === 0) return res.json({ items: [] });
    const cartId = cartRes.rows[0].id;
    const items = await query(
      `SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.description, p.price, p.image_url
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1`,
      [cartId]
    );
    res.json({ items: items.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
}

export async function removeCartItem(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const itemId = req.params.id;
    const cartRes = await query('SELECT * FROM carts WHERE user_id = $1', [user.id]);
    if (cartRes.rows.length === 0) return res.status(404).json({ error: 'Cart not found' });
    const cartId = cartRes.rows[0].id;
    await query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [itemId, cartId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove item' });
  }
}
