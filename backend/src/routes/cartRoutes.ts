import { Router } from 'express';
import { addOrUpdateCartItem, getCart, removeCartItem } from '../cart';
import { authMiddleware } from '../auth';

const router = Router();

router.post('/items', authMiddleware, addOrUpdateCartItem);
router.get('/', authMiddleware, getCart);
router.delete('/items/:id', authMiddleware, removeCartItem);

export default router;
