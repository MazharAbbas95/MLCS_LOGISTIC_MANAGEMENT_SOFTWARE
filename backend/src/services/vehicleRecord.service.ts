import prisma from '../config/prisma';
import { VehicleRecordInput } from '../validations/vehicleRecord.validation';

export class VehicleRecordService {
  static async create(data: VehicleRecordInput | VehicleRecordInput[]) {
    if (Array.isArray(data)) {
      return await prisma.vehicleRecord.createMany({ data });
    }
    return await prisma.vehicleRecord.create({ data });
  }

  static async getAll(cursor?: number, limit: number = 20, search?: string) {
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { truckNo: { contains: search } },
        { driverName: { contains: search } },
        { driverPhone: { contains: search } },
        { origin: { contains: search } },
        { destination: { contains: search } }
      ];
    }

    const records = await prisma.vehicleRecord.findMany({
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

  static async getById(id: number) {
    return await prisma.vehicleRecord.findFirst({
      where: { id, deletedAt: null }
    });
  }

  static async update(id: number, data: any) {
    return await prisma.vehicleRecord.update({
      where: { id },
      data
    });
  }

  static async delete(id: number) {
    return await prisma.vehicleRecord.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
