import { Request, Response, NextFunction } from 'express';
import { ExpenseService } from '../services/expense.service';
import { expenseSchema } from '../validations/expense.validation';

export class ExpenseController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = expenseSchema.parse(req.body);
      const record = await ExpenseService.create(validatedData);
      res.status(201).json({ success: true, data: record });
    } catch (error) { next(error); }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { cursor, limit, search } = req.query;
      
      const result = await ExpenseService.getAll(
        cursor ? Number(cursor) : undefined,
        limit ? Number(limit) : 20,
        search ? String(search) : undefined
      );
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await ExpenseService.delete(Number(id));
      res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) { next(error); }
  }
}
