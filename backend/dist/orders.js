"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = updateOrderStatus;
exports.createOrder = createOrder;
exports.listOrders = listOrders;
exports.listAllOrders = listAllOrders;
exports.getOrder = getOrder;
const db_1 = require("./db");
// Cập nhật trạng thái đơn hàng (admin)
async function updateOrderStatus(req, res) {
    try {
        const orderId = req.params.id;
        const { status } = req.body;
        if (!['pending', 'paid', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }
        const result = await (0, db_1.query)('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, orderId]);
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Order not found' });
        res.json({ order: result.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update order status' });
    }
}
async function createOrder(req, res) {
    try {
        const user = req.user;
        // get cart
        const cartRes = await (0, db_1.query)('SELECT * FROM carts WHERE user_id = $1', [user.id]);
        if (cartRes.rows.length === 0)
            return res.status(400).json({ error: 'Cart empty' });
        const cartId = cartRes.rows[0].id;
        // support selecting specific items to order (body.items = [{ product_id, quantity }])
        const requestedItems = (req.body && Array.isArray(req.body.items)) ? req.body.items : null;
        let itemsRes;
        if (requestedItems && requestedItems.length > 0) {
            const productIds = requestedItems.map((it) => it.product_id);
            itemsRes = await (0, db_1.query)('SELECT ci.id, ci.quantity, p.id as product_id, p.price FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.cart_id = $1 AND p.id = ANY($2)', [cartId, productIds]);
        }
        else {
            itemsRes = await (0, db_1.query)('SELECT ci.id, ci.quantity, p.id as product_id, p.price FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.cart_id = $1', [cartId]);
        }
        const items = itemsRes.rows;
        if (items.length === 0)
            return res.status(400).json({ error: 'Cart empty' });
        // calculate total
        let total = 0;
        for (const it of items) {
            total += Number(it.price) * Number(it.quantity);
        }
        // create order
        // accept optional shipping info in body; fall back to user's saved address
        const { shipping_name, shipping_city, shipping_state, shipping_phone, shipping_street, shipping_ward } = req.body;
        let shipName = shipping_name;
        let shipCity = shipping_city;
        let shipState = shipping_state;
        let shipPhone = shipping_phone;
        let shipStreet = shipping_street;
        let shipWard = shipping_ward;
        if (!shipStreet) {
            // try to read from user's addresses
            const addrRes = await (0, db_1.query)('SELECT name, city, state, ward, phone, street FROM addresses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [user.id]);
            if (addrRes.rows.length > 0) {
                const addr = addrRes.rows[0];
                shipName = shipName || addr.name;
                shipCity = shipCity || addr.city;
                shipState = shipState || addr.state;
                shipPhone = shipPhone || addr.phone;
                shipStreet = shipStreet || addr.street;
                shipWard = shipWard || addr.ward;
            }
        }
        const ord = await (0, db_1.query)('INSERT INTO orders (user_id, total, status, shipping_name, shipping_city, shipping_state, shipping_phone, shipping_street, shipping_ward) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *', [user.id, total, 'pending', shipName || null, shipCity || null, shipState || null, shipPhone || null, shipStreet || null, shipWard || null]);
        const orderId = ord.rows[0].id;
        // insert order items
        for (const it of items) {
            await (0, db_1.query)('INSERT INTO order_items (order_id, product_id, price, quantity) VALUES ($1, $2, $3, $4)', [orderId, it.product_id, it.price, it.quantity]);
        }
        // remove only ordered items from cart
        if (requestedItems && requestedItems.length > 0) {
            const productIds = requestedItems.map((it) => it.product_id);
            await (0, db_1.query)('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = ANY($2)', [cartId, productIds]);
        }
        else {
            // if no specific items requested, clear whole cart
            await (0, db_1.query)('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
        }
        res.status(201).json({ orderId });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create order' });
    }
}
async function listOrders(req, res) {
    try {
        const user = req.user;
        const orders = await (0, db_1.query)('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [user.id]);
        res.json({ orders: orders.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to list orders' });
    }
}
async function listAllOrders(_req, res) {
    try {
        // return all orders with basic user info for admin
        const orders = await (0, db_1.query)(`
      SELECT o.*, u.id as user_id, u.name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
    `);
        res.json({ orders: orders.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to list all orders' });
    }
}
async function getOrder(req, res) {
    try {
        const user = req.user;
        const orderId = req.params.id;
        const ord = await (0, db_1.query)('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [orderId, user.id]);
        if (ord.rows.length === 0)
            return res.status(404).json({ error: 'Order not found' });
        const items = await (0, db_1.query)('SELECT oi.*, p.name FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = $1', [orderId]);
        res.json({ order: ord.rows[0], items: items.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
}
