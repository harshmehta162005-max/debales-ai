import { NextResponse } from "next/server";
import { getDashboardConfig, updateDashboardConfig } from "@/lib/services/dashboard.service";
import { getSessionUserId } from "@/lib/utils/auth";
import { handleApiError } from "@/lib/utils/apiError";
import { connectToDatabase } from "@/lib/db/mongoose";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const projectSlug = url.searchParams.get("projectSlug");
    if (!projectSlug)
      return NextResponse.json({ error: "projectSlug required" }, { status: 400 });

    const config = await getDashboardConfig(userId, projectSlug);
    return NextResponse.json(config);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const projectSlug = url.searchParams.get("projectSlug");
    if (!projectSlug)
      return NextResponse.json({ error: "projectSlug required" }, { status: 400 });

    const body = await req.json();
    const config = await updateDashboardConfig(userId, projectSlug, body.layout);
    return NextResponse.json(config);
  } catch (error) {
    return handleApiError(error);
  }
}
