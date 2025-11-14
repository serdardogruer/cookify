import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface LogFilters {
  type?: string;
  userId?: number;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface PaginatedLogs {
  logs: any[];
  total: number;
  page: number;
  totalPages: number;
}

const logService = {
  async createLog(
    type: string,
    userId: number | null,
    action: string,
    details: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      // @ts-ignore - Prisma client will be regenerated
      const log = await prisma.systemLog.create({
        data: {
          type,
          userId,
          action,
          details: typeof details === 'string' ? details : JSON.stringify(details),
          ipAddress,
          userAgent,
        },
      });
      return log;
    } catch (error) {
      console.error('Create log error:', error);
      throw error;
    }
  },

  async getLogs(filters: LogFilters = {}): Promise<PaginatedLogs> {
    try {
      const {
        type,
        userId,
        action,
        startDate,
        endDate,
        page = 1,
        limit = 50,
      } = filters;

      const where: any = {};

      if (type) where.type = type;
      if (userId) where.userId = userId;
      if (action) where.action = { contains: action };
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      // @ts-ignore - Prisma client will be regenerated
      const total = await prisma.systemLog.count({ where });
      const skip = (page - 1) * limit;
      const totalPages = Math.ceil(total / limit);

      // @ts-ignore - Prisma client will be regenerated
      const logs = await prisma.systemLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      return { logs, total, page, totalPages };
    } catch (error) {
      console.error('Get logs error:', error);
      throw error;
    }
  },

  async cleanOldLogs(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // @ts-ignore - Prisma client will be regenerated
      const result = await prisma.systemLog.deleteMany({
        where: { createdAt: { lt: cutoffDate } },
      });

      return result.count;
    } catch (error) {
      console.error('Clean old logs error:', error);
      throw error;
    }
  },

  async getLogStats() {
    try {
      // @ts-ignore - Prisma client will be regenerated
      const totalLogs = await prisma.systemLog.count();
      // @ts-ignore - Prisma client will be regenerated
      const userActionCount = await prisma.systemLog.count({ where: { type: 'USER_ACTION' } });
      // @ts-ignore - Prisma client will be regenerated
      const adminActionCount = await prisma.systemLog.count({ where: { type: 'ADMIN_ACTION' } });
      // @ts-ignore - Prisma client will be regenerated
      const systemEventCount = await prisma.systemLog.count({ where: { type: 'SYSTEM_EVENT' } });
      // @ts-ignore - Prisma client will be regenerated
      const last24Hours = await prisma.systemLog.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });

      return {
        totalLogs,
        userActionCount,
        adminActionCount,
        systemEventCount,
        last24Hours,
      };
    } catch (error) {
      console.error('Get log stats error:', error);
      throw error;
    }
  },
};


export { logService };
