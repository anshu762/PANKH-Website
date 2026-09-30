"use server";

import { auth } from "@/auth";
import { notificationService } from "@/services/notification.service";
import { revalidatePath } from "next/cache";

export async function getNotificationsAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", notifications: [], unreadCount: 0 };
  }

  try {
    // Run automated checks in background to evaluate checkin/vaccine/weekly rules
    await notificationService.runAutomatedChecksForFarmer(session.user.id);

    const [notifications, unreadCount] = await Promise.all([
      notificationService.getFarmerNotifications(session.user.id),
      notificationService.getUnreadCount(session.user.id),
    ]);

    return { notifications, unreadCount };
  } catch (error) {
    console.error("Error loading notifications:", error);
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markNotificationReadAction(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  await notificationService.markAsRead(notificationId, session.user.id);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  await notificationService.markAllAsRead(session.user.id);
  revalidatePath("/dashboard");
  return { success: true };
}
