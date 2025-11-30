import { Request, Response } from 'express';
import { query } from './db';

export async function createOrder(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    // get cart
    const cartRes = await query('SELECT * FROM carts WHERE user_id = $1', [user.id]);
    if (cartRes.rows.length === 0) return res.status(400).json({ error: 'Cart empty' });
    const cartId = cartRes.rows[0].id;
    // support selecting specific items to order (body.items = [{ product_id, quantity }])
    const requestedItems = (req.body && Array.isArray((req.body as any).items)) ? (req.body as any).items : null;
    let itemsRes;
    if (requestedItems && requestedItems.length > 0) {
      const productIds = requestedItems.map((it: any) => it.product_id);
      itemsRes = await query(
        'SELECT ci.id, ci.quantity, p.id as product_id, p.price FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.cart_id = $1 AND p.id = ANY($2)',
        [cartId, productIds]
      );
    } else {
      itemsRes = await query('SELECT ci.id, ci.quantity, p.id as product_id, p.price FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.cart_id = $1', [cartId]);
    }
    const items = itemsRes.rows;
    if (items.length === 0) return res.status(400).json({ error: 'Cart empty' });

    // calculate total
    let total = 0;
    for (const it of items) {
      total += Number(it.price) * Number(it.quantity);
    }

    // create order
    // accept optional shipping info in body; fall back to user's saved address
    const { shipping_name, shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postal_code, shipping_country, shipping_phone } = req.body;

    let shipName = shipping_name;
    let shipLine1 = shipping_address_line1;
    let shipLine2 = shipping_address_line2;
    let shipCity = shipping_city;
    let shipState = shipping_state;
    let shipPostal = shipping_postal_code;
    let shipCountry = shipping_country;
    let shipPhone = shipping_phone;

    if (!shipLine1) {
      // try to read from user's addresses
      const addrRes = await query('SELECT name, address_line1, city, district, postal_code, country, phone FROM addresses WHERE user_id = $1 ORDER BY id LIMIT 1', [user.id]);
      if (addrRes.rows.length > 0) {
        const addr = addrRes.rows[0];
        shipName = shipName || addr.name;
        shipLine1 = shipLine1 || addr.address_line1;
        shipCity = shipCity || addr.city;
        shipState = shipState || addr.district;
        shipPostal = shipPostal || addr.postal_code;
        shipCountry = shipCountry || addr.country;
        shipPhone = shipPhone || addr.phone;
      }
    }

    const ord = await query(
      'INSERT INTO orders (user_id, total, status, shipping_name, shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postal_code, shipping_country, shipping_phone) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
      [user.id, total, 'placed', shipName || null, shipLine1 || null, shipLine2 || null, shipCity || null, shipState || null, shipPostal || null, shipCountry || null, shipPhone || null]
    );
    const orderId = ord.rows[0].id;

    // insert order items
    for (const it of items) {
      await query('INSERT INTO order_items (order_id, product_id, price, quantity) VALUES ($1, $2, $3, $4)', [orderId, it.product_id, it.price, it.quantity]);
    }

    // remove only ordered items from cart
    if (requestedItems && requestedItems.length > 0) {
      const productIds = requestedItems.map((it: any) => it.product_id);
      await query('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = ANY($2)', [cartId, productIds]);
    } else {
      // if no specific items requested, clear whole cart
      await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    }

    res.status(201).json({ orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
}

export async function listOrders(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const orders = await query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [user.id]);
    res.json({ orders: orders.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list orders' });
  }
}

export async function listAllOrders(_req: Request, res: Response) {
  try {
    // return all orders with basic user info for admin
    const orders = await query(`
      SELECT o.*, u.id as user_id, u.name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
    `);
    res.json({ orders: orders.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list all orders' });
  }
}

export async function getOrder(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const orderId = req.params.id;
    const ord = await query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [orderId, user.id]);
    if (ord.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const items = await query('SELECT oi.*, p.name FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = $1', [orderId]);
    res.json({ order: ord.rows[0], items: items.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}
