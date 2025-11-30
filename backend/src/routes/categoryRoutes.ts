import { Router } from 'express';
import { listCategories, createCategory } from '../categories';
import { authMiddleware, adminMiddleware } from '../auth';

const router = Router();

router.get('/', listCategories);
router.post('/', authMiddleware, adminMiddleware, createCategory);

export default router;
