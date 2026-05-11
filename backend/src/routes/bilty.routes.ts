import { Router } from 'express';
import { BiltyController } from '../controllers/bilty.controller';

const router = Router();

// Ensure path is exactly as expected
router.post('/download-pdf', BiltyController.downloadPdf);
router.post('/batch-pdf', BiltyController.queueBatchPdf);
router.post('/', BiltyController.create);
router.get('/', BiltyController.getAll);
router.delete('/:id', BiltyController.delete);

export default router;
