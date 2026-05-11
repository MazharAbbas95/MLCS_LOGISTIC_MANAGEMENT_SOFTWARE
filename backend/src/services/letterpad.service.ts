import prisma from '../config/prisma';
import { LetterpadInput } from '../validations/letterpad.validation';

export class LetterpadService {
  static async create(data: LetterpadInput) {
    return await prisma.letterpad.create({ data });
  }

  static async getAll(cursor?: number, limit: number = 20) {
    const records = await prisma.letterpad.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      where: { deletedAt: null },
      orderBy: { id: 'desc' }
    });

    const hasNextPage = records.length > limit;
    const items = hasNextPage ? records.slice(0, -1) : records;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return { data: items, nextCursor };
  }

  static async delete(id: number) {
    return await prisma.letterpad.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
