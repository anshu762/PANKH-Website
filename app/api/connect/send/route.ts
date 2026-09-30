import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectService } from "@/services/connect.service";
import { sendCaseSummarySchema } from "@/schemas/connect";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = sendCaseSummarySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const { caseId, vetLabId, consentGiven, preferredChannel } = validation.data;

    const { result, caseRecord } = await connectService.sendCaseSummaryToVet({
      caseId,
      vetLabId,
      consentGiven,
      channel: preferredChannel,
      actorUserId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      result,
      caseRecord,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("API /api/connect/send error:", error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
