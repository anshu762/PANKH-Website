import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { FarmOnboardingWizard } from "@/components/onboarding/farm-onboarding-wizard";

export default async function FarmOnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/onboarding/farm");
  }

  const role = session.user.role;
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    redirect("/admin");
  }
  if (role === "VET") {
    redirect("/vet");
  }

  const farmer = await prisma.farmer.findUnique({
    where: { userId: session.user.id },
    include: {
      farms: {
        include: {
          batches: {
            where: { status: "ACTIVE" },
          },
        },
      },
    },
  });

  // If farmer already has configured farm and active flock, redirect straight to dashboard
  if (farmer && farmer.farms.length > 0 && farmer.farms[0].batches.length > 0) {
    redirect("/dashboard");
  }

  return (
    <FarmOnboardingWizard
      initialFarmerName={session.user.name || ""}
      initialVillage={farmer?.village || ""}
      initialDistrict={farmer?.district || ""}
    />
  );
}
