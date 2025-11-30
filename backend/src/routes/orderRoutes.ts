import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../auth';
import { createOrder, listOrders, getOrder, listAllOrders } from '../orders';

const router = Router();

router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, listOrders);
router.get('/admin', authMiddleware, adminMiddleware, listAllOrders);
router.get('/:id', authMiddleware, getOrder);

export default router;
