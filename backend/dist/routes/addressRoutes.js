"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../auth");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// Get all addresses for current user
router.get('/', auth_1.authMiddleware, async (req, res) => {
    const user = req.user;
    // return all relevant address columns
    const result = await (0, db_1.query)('SELECT id, label, name, phone, city, state, district, ward, street, created_at FROM addresses WHERE user_id = $1 ORDER BY created_at DESC', [user.id]);
    res.json({ addresses: result.rows });
});
// Add new address
router.post('/', auth_1.authMiddleware, async (req, res) => {
    const user = req.user;
    const { label, name, phone, city, state, district, ward, street } = req.body;
    const result = await (0, db_1.query)('INSERT INTO addresses (user_id, label, name, phone, city, state, district, ward, street) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *', [user.id, label, name, phone, city, state, district, ward, street]);
    res.status(201).json(result.rows[0]);
});
// Update address
router.put('/:id', auth_1.authMiddleware, async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    const { label, name, phone, city, state, district, ward, street } = req.body;
    const result = await (0, db_1.query)('UPDATE addresses SET label=$1, name=$2, phone=$3, city=$4, state=$5, district=$6, ward=$7, street=$8 WHERE id=$9 AND user_id=$10 RETURNING *', [label, name, phone, city, state, district, ward, street, id, user.id]);
    if (result.rows.length === 0)
        return res.status(404).json({ error: 'Address not found' });
    res.json(result.rows[0]);
});
// Delete address
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    await (0, db_1.query)('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [id, user.id]);
    res.json({ success: true });
});
exports.default = router;
