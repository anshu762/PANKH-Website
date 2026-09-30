"use server";

import { auth } from "@/auth";
import { sentinelService } from "@/services/sentinel.service";
import { FarmerActionType, SentinelCheckinInput } from "@/types/sentinel";
import { revalidatePath } from "next/cache";

export async function getSentinelData() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const data = await sentinelService.getSentinelDashboardData(session.user.id);
    if (!data) {
      return { needsOnboarding: true };
    }
    return { success: true, data };
  } catch (error: any) {
    console.error("Error in getSentinelData action:", error);
    return { error: error.message || "Failed to load Sentinel dashboard data" };
  }
}

export async function submitFarmerAlertAction(
  alertId: string,
  action: FarmerActionType,
  notes?: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const result = await sentinelService.handleFarmerAction(
      session.user.id,
      alertId,
      action,
      notes
    );

    revalidatePath("/dashboard/sentinel");
    revalidatePath("/dashboard");

    return { success: true, alert: result };
  } catch (error: any) {
    console.error("Error submitting farmer alert action:", error);
    return { error: error.message || "Failed to record action" };
  }
}

export async function submitCheckinAction(input: SentinelCheckinInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const result = await sentinelService.processCheckin(session.user.id, input);

    revalidatePath("/dashboard/sentinel");
    revalidatePath("/dashboard");

    return {
      success: true,
      logId: result.log.id,
      alertId: result.alert.id,
      caseId: result.caseRecord?.id || null,
      severity: result.risk.severity,
      reasons: result.risk.reasons,
      recommendations: result.risk.recommendations,
      signalsTriggered: result.risk.signalsTriggered,
    };
  } catch (error: any) {
    console.error("Error submitting checkin action:", error);
    return { error: error.message || "Failed to submit daily check-in" };
  }
}
