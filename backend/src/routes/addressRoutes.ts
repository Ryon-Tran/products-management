import { Router } from 'express';
import { authMiddleware } from '../auth';
import { query } from '../db';

const router = Router();

// Get all addresses for current user
router.get('/', authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const result = await query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at DESC', [user.id]);
  res.json({ addresses: result.rows });
});

// Add new address
router.post('/', authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const { label, name, phone, address_line1, city, district, ward } = req.body;
  const result = await query(
    'INSERT INTO addresses (user_id, label, name, phone, address_line1, city, district, ward) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
    [user.id, label, name, phone, address_line1, city, district, ward]
  );
  res.status(201).json(result.rows[0]);
});

// Update address
router.put('/:id', authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;
  const { label, name, phone, address_line1, city, district, ward } = req.body;
  const result = await query(
    'UPDATE addresses SET label=$1, name=$2, phone=$3, address_line1=$4, city=$5, district=$6, ward=$7 WHERE id=$8 AND user_id=$9 RETURNING *',
    [label, name, phone, address_line1, city, district, ward, id, user.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Address not found' });
  res.json(result.rows[0]);
});

// Delete address
router.delete('/:id', authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;
  await query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [id, user.id]);
  res.json({ success: true });
});

export default router;
