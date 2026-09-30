import { adminService } from "@/services/admin.service";
import { SystemAnalyticsView } from "@/components/admin/analytics/system-analytics-view";

export default async function AdminSystemAnalyticsPage() {
  const data = await adminService.getSystemAnalytics();

  return <SystemAnalyticsView initialData={data} />;
}
