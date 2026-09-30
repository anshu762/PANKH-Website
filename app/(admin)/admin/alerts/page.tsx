import { adminService } from "@/services/admin.service";
import { AlertsQueueView } from "@/components/admin/alerts/alerts-queue-view";

export default async function AdminAlertsPage() {
  const alerts = await adminService.getHighRiskAlertsQueue("ALL");

  return <AlertsQueueView initialAlerts={alerts} />;
}
