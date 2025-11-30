import { Router } from 'express';
import { login, register, me } from '../auth';
import { authMiddleware } from '../auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);

export default router;
