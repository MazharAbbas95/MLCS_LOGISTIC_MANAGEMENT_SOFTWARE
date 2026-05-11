import prisma from '../config/prisma';
import { BiltyInput } from '../validations/bilty.validation';

export class BiltyService {
  static async create(data: BiltyInput) {
    const formattedData = {
      ...data,
      cnic: data.cnic ? JSON.stringify(data.cnic) : null,
      containerNo: data.containerNo ? JSON.stringify(data.containerNo) : null,
    };
    return await prisma.bilty.create({ data: formattedData as any });
  }

  static async getAll(cursor?: number, limit: number = 20, search?: string) {
    const where: any = { deletedAt: null };
    
    if (search) {
      where.OR = [
        { biltyNo: { contains: search } },
        { truckNo: { contains: search } },
        { sender: { contains: search } },
        { receiver: { contains: search } }
      ];
    }

    const bilties = await prisma.bilty.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      where,
      orderBy: { id: 'desc' }
    });

    const hasNextPage = bilties.length > limit;
    const items = hasNextPage ? bilties.slice(0, -1) : bilties;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    const mappedItems = items.map(b => ({
      ...b,
      cnic: b.cnic ? JSON.parse(b.cnic) : null,
      containerNo: b.containerNo ? JSON.parse(b.containerNo) : null,
    }));

    return { data: mappedItems, nextCursor };
  }

  static async delete(id: number) {
    return await prisma.bilty.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
