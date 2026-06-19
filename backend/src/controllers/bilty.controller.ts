import { Request, Response, NextFunction } from 'express';
import { BiltyService } from '../services/bilty.service';
import { biltySchema } from '../validations/bilty.validation';
import { addPdfToQueue } from '../services/queue.service';

export class BiltyController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = biltySchema.parse(req.body);
      const record = await BiltyService.create(validatedData);
      res.status(201).json({ success: true, data: record });
    } catch (error) { next(error); }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { cursor, limit, search } = req.query;
      const result = await BiltyService.getAll(
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
      await BiltyService.delete(Number(id));
      res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) { next(error); }
  }

  static async queueBatchPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, message: 'Items array required' });
      }

      const jobs = await Promise.all(items.map(item => addPdfToQueue(item)));

      res.json({
        success: true,
        message: `${items.length} PDF jobs queued for background processing`,
        jobIds: jobs.map(j => j.id)
      });
    } catch (error) { next(error); }
  }
}
