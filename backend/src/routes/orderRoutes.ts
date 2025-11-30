import { Router } from 'express';
import { authMiddleware } from '../auth';
import { createOrder, listOrders, getOrder } from '../orders';

const router = Router();

router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, listOrders);
router.get('/:id', authMiddleware, getOrder);

export default router;
