import { auth } from "@/auth";
import { getFarmerDashboardData } from "@/actions/farmer";
import { FarmerProfileView } from "@/components/dashboard/farmer-profile-view";
import { redirect } from "next/navigation";

export default async function FarmerProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/profile");
  }

  const data = await getFarmerDashboardData();

  if (data.needsOnboarding) {
    redirect("/onboarding/farm");
  }

  return (
    <FarmerProfileView
      farmer={data.farmer}
      farm={data.farm}
      batch={data.batch}
    />
  );
}
