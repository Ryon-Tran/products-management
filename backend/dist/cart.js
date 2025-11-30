"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOrUpdateCartItem = addOrUpdateCartItem;
exports.getCart = getCart;
exports.removeCartItem = removeCartItem;
const db_1 = require("./db");
// Add or update cart item
async function addOrUpdateCartItem(req, res) {
    try {
        const user = req.user;
        const { product_id, quantity } = req.body;
        if (!product_id || !quantity)
            return res.status(400).json({ error: 'Missing fields' });
        // ensure cart exists
        let cart = await (0, db_1.query)('SELECT * FROM carts WHERE user_id = $1', [user.id]);
        if (cart.rows.length === 0) {
            const r = await (0, db_1.query)('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [user.id]);
            cart = r;
        }
        const cartId = cart.rows[0].id;
        // upsert cart item
        await (0, db_1.query)(`INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity`, [cartId, product_id, quantity]);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update cart' });
    }
}
async function getCart(req, res) {
    try {
        const user = req.user;
        const cartRes = await (0, db_1.query)('SELECT * FROM carts WHERE user_id = $1', [user.id]);
        if (cartRes.rows.length === 0)
            return res.json({ items: [] });
        const cartId = cartRes.rows[0].id;
        const items = await (0, db_1.query)(`SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.description, p.price, p.image_url
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1`, [cartId]);
        res.json({ items: items.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
}
async function removeCartItem(req, res) {
    try {
        const user = req.user;
        const itemId = req.params.id;
        const cartRes = await (0, db_1.query)('SELECT * FROM carts WHERE user_id = $1', [user.id]);
        if (cartRes.rows.length === 0)
            return res.status(404).json({ error: 'Cart not found' });
        const cartId = cartRes.rows[0].id;
        await (0, db_1.query)('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [itemId, cartId]);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to remove item' });
    }
}
