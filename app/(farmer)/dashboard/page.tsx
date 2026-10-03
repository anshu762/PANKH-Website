import { auth } from "@/auth";
import { getFarmerDashboardData } from "@/actions/farmer";
import { FarmerHomeView } from "@/components/dashboard/farmer-home-view";
import { redirect } from "next/navigation";

export default async function FarmerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const role = session.user.role;
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    redirect("/admin");
  }
  if (role === "VET") {
    redirect("/vet");
  }

  const data = await getFarmerDashboardData();

  if (data.needsOnboarding) {
    redirect("/onboarding/farm");
  }

  return (
    <FarmerHomeView
      farmer={data.farmer}
      farm={data.farm}
      batch={data.batch}
      todayLog={data.todayLog}
      latestAlert={data.latestAlert}
      recentAlerts={data.recentAlerts || []}
      recentLogs={data.recentLogs || []}
      flockCycle={data.flockCycle}
      weather={data.weather}
      economics={data.economics!}
    />
  );
}
