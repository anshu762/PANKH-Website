import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { sentinelService } from "@/services/sentinel.service";
import { SentinelView } from "@/components/sentinel/sentinel-view";

export const metadata = {
  title: "Pankh Sentinel | Early Disease Risk Radar",
  description: "Early poultry disease surveillance, rolling 7-day baseline deviations, and automated urgent triage.",
};

export default async function SentinelDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/sentinel");
  }

  const data = await sentinelService.getSentinelDashboardData(session.user.id);

  if (!data || !data.batch) {
    redirect("/onboarding/farm");
  }

  return <SentinelView data={data} />;
}
