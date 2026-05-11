import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware as any, ReportController.getAll);
router.post('/', authMiddleware as any, ReportController.create);

export default router;
