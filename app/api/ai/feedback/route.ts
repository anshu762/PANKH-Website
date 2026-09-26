import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { feedbackInputSchema } from "@/schemas/ai";
import { aiOrchestrationService } from "@/services/ai/ai-orchestration.service";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = feedbackInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid feedback payload", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const result = await aiOrchestrationService.recordFeedback(
      session.user.id,
      validation.data
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Feedback Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to record feedback." },
      { status: error.message === "Message not found" ? 404 : 500 }
    );
  }
}
