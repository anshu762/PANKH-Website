import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sentinelCheckinSchema } from "@/schemas/sentinel";
import { sentinelService } from "@/services/sentinel.service";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = sentinelCheckinSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid check-in data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const result = await sentinelService.processCheckin(
      session.user.id,
      validation.data
    );

    return NextResponse.json({
      success: true,
      logId: result.log.id,
      alertId: result.alert.id,
      caseId: result.caseRecord?.id || null,
      severity: result.risk.severity,
      reasons: result.risk.reasons,
      recommendations: result.risk.recommendations,
      signalsTriggered: result.risk.signalsTriggered,
      baseline: result.baseline,
    });
  } catch (error: any) {
    console.error("Sentinel Checkin API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process daily check-in" },
      { status: 500 }
    );
  }
}
