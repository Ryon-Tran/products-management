import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../auth';

import { createOrder, listOrders, getOrder, listAllOrders, updateOrderStatus } from '../orders';
const router = Router();
// Admin cập nhật trạng thái đơn hàng
router.put('/admin/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);

router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, listOrders);
router.get('/admin', authMiddleware, adminMiddleware, listAllOrders);
router.get('/:id', authMiddleware, getOrder);

export default router;
