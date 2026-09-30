import { prisma } from "@/lib/db";
import {
  evaluateDailyCheckinReminder,
  evaluateVaccinationSchedule,
  evaluateWeeklyEconomicsNotification,
} from "@/lib/notifications/rules";

export class NotificationService {
  /**
   * Retrieves notifications for authenticated farmer.
   */
  async getFarmerNotifications(userId: string, limit: number = 20) {
    const farmer = await prisma.farmer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!farmer) return [];

    return await prisma.notification.findMany({
      where: { farmerId: farmer.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Returns count of unread notifications for farmer.
   */
  async getUnreadCount(userId: string): Promise<number> {
    const farmer = await prisma.farmer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!farmer) return 0;

    return await prisma.notification.count({
      where: {
        farmerId: farmer.id,
        read: false,
      },
    });
  }

  /**
   * Marks a single notification as read.
   */
  async markAsRead(notificationId: string, userId: string) {
    const farmer = await prisma.farmer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!farmer) return false;

    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        farmerId: farmer.id,
      },
      data: { read: true },
    });

    return true;
  }

  /**
   * Marks all notifications as read for farmer.
   */
  async markAllAsRead(userId: string) {
    const farmer = await prisma.farmer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!farmer) return false;

    await prisma.notification.updateMany({
      where: {
        farmerId: farmer.id,
        read: false,
      },
      data: { read: true },
    });

    return true;
  }

  /**
   * Evaluates automated background notification triggers (Check-in, Vaccination, Economics).
   */
  async runAutomatedChecksForFarmer(userId: string) {
    const farmer = await prisma.farmer.findUnique({
      where: { userId },
      include: {
        farms: {
          include: {
            batches: {
              where: { status: "ACTIVE" },
              take: 1,
            },
          },
          take: 1,
        },
      },
    });

    const activeBatch = farmer?.farms[0]?.batches[0];
    if (!farmer || !activeBatch) return;

    // 1. Daily check-in reminder
    await evaluateDailyCheckinReminder(farmer.id, activeBatch.id);

    // 2. Scheduled vaccination reminder
    await evaluateVaccinationSchedule(farmer.id, activeBatch.id);

    // 3. Weekly economics insight
    await evaluateWeeklyEconomicsNotification(farmer.id, activeBatch.id);
  }
}

export const notificationService = new NotificationService();
