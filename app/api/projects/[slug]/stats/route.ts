import { NextResponse } from "next/server";
import { getProjectStats } from "@/lib/services/stats.service";
import { getSessionUserId } from "@/lib/utils/auth";
import { handleApiError } from "@/lib/utils/apiError";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const userId = getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const stats = await getProjectStats(userId, slug);
    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
