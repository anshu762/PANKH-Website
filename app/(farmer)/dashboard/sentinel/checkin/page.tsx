import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { sentinelService } from "@/services/sentinel.service";
import { weatherService } from "@/services/weather.service";
import { CheckinForm } from "@/components/sentinel/checkin-form";

export const metadata = {
  title: "Daily Check-in | Pankh Sentinel",
  description: "Record daily flock mortality, feed, and water consumption in under 60 seconds.",
};

export default async function SentinelCheckinPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/sentinel/checkin");
  }

  const context = await sentinelService.getFarmerActiveBatch(session.user.id);

  if (!context || !context.batch) {
    redirect("/onboarding/farm");
  }

  const weather = await weatherService.getWeatherForFarm(
    context.farm.latitude,
    context.farm.longitude,
    context.farmer.district
  );

  return (
    <div className="py-4 sm:py-6 animate-in fade-in duration-300">
      <CheckinForm batch={context.batch} farm={context.farm} weather={weather} />
    </div>
  );
}

