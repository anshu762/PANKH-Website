import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { notificationService } from "@/services/notification.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [notifications, unreadCount] = await Promise.all([
      notificationService.getFarmerNotifications(session.user.id),
      notificationService.getUnreadCount(session.user.id),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("API Notifications Error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
