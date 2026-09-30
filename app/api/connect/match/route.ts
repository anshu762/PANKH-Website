import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectService } from "@/services/connect.service";
import { VetLabType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("caseId") || undefined;
    const latParam = searchParams.get("latitude");
    const lngParam = searchParams.get("longitude");
    const radiusParam = searchParams.get("radiusKm");
    const typeParam = searchParams.get("type");
    const teleconsultParam = searchParams.get("teleconsultOnly");
    const limitParam = searchParams.get("limit");

    const originCoords =
      latParam && lngParam
        ? { latitude: parseFloat(latParam), longitude: parseFloat(lngParam) }
        : undefined;

    const radiusKm = radiusParam ? parseFloat(radiusParam) : undefined;
    const type = typeParam && Object.values(VetLabType).includes(typeParam as VetLabType)
      ? (typeParam as VetLabType)
      : undefined;
    const teleconsultOnly = teleconsultParam === "true";
    const limit = limitParam ? parseInt(limitParam, 10) : 5;

    const matchedVets = await connectService.matchVets({
      originCoords,
      caseId,
      radiusKm,
      type,
      teleconsultOnly,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: matchedVets,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("API /api/connect/match error:", error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
