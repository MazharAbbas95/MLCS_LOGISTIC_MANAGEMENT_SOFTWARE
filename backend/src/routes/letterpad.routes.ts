import { Router } from 'express';
import { LetterpadController } from '../controllers/letterpad.controller';

const router = Router();

router.post('/', LetterpadController.create);
router.get('/', LetterpadController.getAll);
router.delete('/:id', LetterpadController.delete);

export default router;
