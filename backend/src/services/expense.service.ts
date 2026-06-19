import prisma from '../config/prisma';
import { ExpenseInput } from '../validations/expense.validation';

export class ExpenseService {
  static async create(data: ExpenseInput) {
    return await prisma.expense.create({ data });
  }

  static async getAll(cursor?: number, limit: number = 20, search?: string) {
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { description: { contains: search } },
        { expenseMonth: { contains: search } },
      ];
    }

    const records = await prisma.expense.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      where,
      orderBy: { id: 'desc' }
    });

    const hasNextPage = records.length > limit;
    const items = hasNextPage ? records.slice(0, -1) : records;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return { data: items, nextCursor };
  }

  static async delete(id: number) {
    return await prisma.expense.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
