import { auth } from "@/auth";
import { FarmerDashboardView } from "@/components/dashboard/farmer-dashboard-view";

export default async function FarmerDashboardPage() {
  const session = await auth();

  return <FarmerDashboardView session={session} />;
}
