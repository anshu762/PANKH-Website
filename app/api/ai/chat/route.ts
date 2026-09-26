import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { chatInputSchema } from "@/schemas/ai";
import { aiOrchestrationService } from "@/services/ai/ai-orchestration.service";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = chatInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const result = await aiOrchestrationService.processFarmerQuery(
      session.user.id,
      validation.data
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Chat Route Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred while processing your request." },
      { status: 500 }
    );
  }
}
