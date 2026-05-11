import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { VehicleRecordService } from '../services/vehicleRecord.service';
import { vehicleRecordSchema } from '../validations/vehicleRecord.validation';

export class VehicleRecordController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      let validatedData;
      
      if (Array.isArray(data)) {
        validatedData = z.array(vehicleRecordSchema).parse(data);
      } else {
        validatedData = vehicleRecordSchema.parse(data);
      }
      
      const record = await VehicleRecordService.create(validatedData);
      res.status(201).json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { cursor, limit, search } = req.query;
      const result = await VehicleRecordService.getAll(
        cursor ? Number(cursor) : undefined,
        limit ? Number(limit) : 20,
        search ? String(search) : undefined
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const record = await VehicleRecordService.getById(Number(id));
      if (!record) {
        return res.status(404).json({ success: false, message: 'Record not found' });
      }
      res.json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = vehicleRecordSchema.partial().parse(req.body);
      const record = await VehicleRecordService.update(Number(id), validatedData);
      res.json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await VehicleRecordService.delete(Number(id));
      res.json({ success: true, message: 'Record deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
