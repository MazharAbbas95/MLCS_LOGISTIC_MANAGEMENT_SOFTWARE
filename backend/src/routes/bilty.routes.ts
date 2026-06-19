import { Router } from 'express';
import { BiltyController } from '../controllers/bilty.controller';

const router = Router();

router.post('/batch-pdf', BiltyController.queueBatchPdf);
router.post('/', BiltyController.create);
router.get('/', BiltyController.getAll);
router.delete('/:id', BiltyController.delete);

export default router;
