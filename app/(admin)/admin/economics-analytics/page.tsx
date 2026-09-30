import { adminService } from "@/services/admin.service";
import { EconomicsAnalyticsView } from "@/components/admin/economics-analytics/economics-analytics-view";

export default async function AdminEconomicsAnalyticsPage() {
  const data = await adminService.getAggregatedEconomicsAnalytics();

  return <EconomicsAnalyticsView initialData={data} />;
}
