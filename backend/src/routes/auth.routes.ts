import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.post('/setup', AuthController.setup);
router.post('/update-password', authMiddleware, AuthController.updatePassword);

export default router;
