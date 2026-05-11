import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller';

const router = Router();

router.post('/', ExpenseController.create);
router.get('/', ExpenseController.getAll);
router.delete('/:id', ExpenseController.delete);

export default router;
