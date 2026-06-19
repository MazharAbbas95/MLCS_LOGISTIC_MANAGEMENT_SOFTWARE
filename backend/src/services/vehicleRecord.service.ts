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
        { biltyNo: { contains: search } },
        { driverNo: { contains: search } },
        { loadingStation: { contains: search } },
        { unloadingStation: { contains: search } },
        { partyMillName: { contains: search } },
        { broker: { contains: search } },
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

  static async getStats() {
    const now = new Date();
    // Start and end of current month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    // Start and end of today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const baseWhere = { deletedAt: null };
    const monthWhere = { ...baseWhere, createdAt: { gte: monthStart, lte: monthEnd } };
    const todayWhere = { ...baseWhere, createdAt: { gte: todayStart, lte: todayEnd } };

    // Run all queries in parallel
    const [
      totalMonthlyVehicles,
      todayVehicles,
      monthlyRevenueAgg,
      monthlyCommissionAgg,
      pendingCommissionAgg,
      recentVehicles,
    ] = await Promise.all([
      prisma.vehicleRecord.count({ where: monthWhere }),
      prisma.vehicleRecord.count({ where: todayWhere }),
      prisma.vehicleRecord.aggregate({ where: monthWhere, _sum: { partyKariya: true } }),
      prisma.vehicleRecord.aggregate({ where: monthWhere, _sum: { commission: true } }),
      prisma.vehicleRecord.aggregate({
        where: { ...monthWhere, commissionStatus: { not: 'Paid' } },
        _sum: { commission: true }
      }),
      prisma.vehicleRecord.findMany({
        where: baseWhere,
        orderBy: { id: 'desc' },
        take: 5,
      }),
    ]);

    return {
      totalMonthlyVehicles,
      todayVehicles,
      totalMonthlyRevenue: monthlyRevenueAgg._sum.partyKariya ?? 0,
      totalCommission: monthlyCommissionAgg._sum.commission ?? 0,
      pendingPayments: pendingCommissionAgg._sum.commission ?? 0,
      recentVehicles,
    };
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
