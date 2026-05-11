import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export class ReportController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const reports = await prisma.report.findMany({
        orderBy: { createdAt: 'desc' }
      });
      const formattedReports = reports.map(r => ({
        ...r,
        details: r.details ? JSON.parse(r.details) : null
      }));
      res.json(formattedReports);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    const { period, revenue, expenses, net, type, details } = req.body;
    try {
      const report = await prisma.report.create({
        data: {
          period,
          revenue: Number(revenue),
          expenses: Number(expenses),
          net: Number(net),
          type,
          details: JSON.stringify(details)
        }
      });
      res.status(201).json({ id: report.id });
    } catch (error) {
      next(error);
    }
  }
}
