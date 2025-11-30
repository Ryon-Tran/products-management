"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategories = listCategories;
exports.createCategory = createCategory;
const db_1 = require("./db");
async function listCategories(_req, res) {
    try {
        const r = await (0, db_1.query)('SELECT * FROM categories ORDER BY name');
        res.json(r.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
}
async function createCategory(req, res) {
    try {
        const { name } = req.body;
        if (!name || typeof name !== 'string')
            return res.status(400).json({ error: 'Missing or invalid name' });
        const r = await (0, db_1.query)('INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING *', [name]);
        res.status(201).json(r.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create category' });
    }
}
