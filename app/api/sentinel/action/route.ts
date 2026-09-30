import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { farmerActionSchema } from "@/schemas/sentinel";
import { sentinelService } from "@/services/sentinel.service";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = farmerActionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid action data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const updatedAlert = await sentinelService.handleFarmerAction(
      session.user.id,
      validation.data.alertId,
      validation.data.action,
      validation.data.notes
    );

    return NextResponse.json({
      success: true,
      alertId: updatedAlert.id,
      action: validation.data.action,
      acknowledged: updatedAlert.acknowledged,
    });
  } catch (error: any) {
    console.error("Sentinel Action API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit farmer action" },
      { status: 500 }
    );
  }
}
