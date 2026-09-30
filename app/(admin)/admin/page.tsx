import { auth } from "@/auth";
import { adminService } from "@/services/admin.service";
import { AdminOverviewView } from "@/components/admin/admin-overview-view";

export default async function AdminDashboardPage() {
  const [stats, alerts, aiReviews] = await Promise.all([
    adminService.getAdminOverviewStats(),
    adminService.getHighRiskAlertsQueue("RED"),
    adminService.getAiReviewQueue(),
  ]);

  return (
    <AdminOverviewView
      stats={stats}
      recentAlerts={alerts}
      recentAiFeedback={aiReviews}
    />
  );
}
