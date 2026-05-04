import { NextResponse } from "next/server";
import { getUserProjects } from "@/lib/access";
import { getSessionUserId } from "@/lib/utils/auth";
import { handleApiError } from "@/lib/utils/apiError";
import { connectToDatabase } from "@/lib/db/mongoose";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const userId = getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const projects = await getUserProjects(userId);
    return NextResponse.json(projects);
  } catch (error) {
    return handleApiError(error);
  }
}
