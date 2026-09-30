import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { economicsService } from "@/services/economics.service";
import { EconomicsDashboardView } from "@/components/dashboard/economics/economics-dashboard-view";

interface EconomicsPageProps {
  searchParams?: {
    batchId?: string;
  };
}

export default async function FarmerEconomicsPage({
  searchParams,
}: EconomicsPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/economics");
  }

  const data = await economicsService.getBatchEconomicsDashboardData(
    session.user.id,
    searchParams?.batchId
  );

  return <EconomicsDashboardView initialData={data} />;
}
