import { Request, Response, NextFunction } from 'express';
import { LetterpadService } from '../services/letterpad.service';
import { letterpadSchema } from '../validations/letterpad.validation';

export class LetterpadController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = letterpadSchema.parse(req.body);
      const record = await LetterpadService.create(validatedData);
      res.status(201).json({ success: true, data: record });
    } catch (error) { next(error); }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      
      const result = await LetterpadService.getAll(cursor, limit);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await LetterpadService.delete(Number(id));
      res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) { next(error); }
  }
}
