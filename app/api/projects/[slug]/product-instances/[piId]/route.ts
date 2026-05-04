import { NextResponse } from "next/server";
import { updateIntegrations } from "@/lib/services/integration.service";
import { getSessionUserId } from "@/lib/utils/auth";
import { handleApiError } from "@/lib/utils/apiError";
import { connectToDatabase } from "@/lib/db/mongoose";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string; piId: string }> }
) {
  try {
    await connectToDatabase();
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug, piId } = await params;
    const body = await req.json();
    const result = await updateIntegrations(userId, slug, piId, body.integrations);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
