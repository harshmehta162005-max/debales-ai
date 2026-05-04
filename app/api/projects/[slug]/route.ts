import { NextResponse } from "next/server";
import { getProject } from "@/lib/services/project.service";
import { getSessionUserId } from "@/lib/utils/auth";
import { handleApiError } from "@/lib/utils/apiError";
import { connectToDatabase } from "@/lib/db/mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    const userId = getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const project = await getProject(userId, slug);
    return NextResponse.json(project);
  } catch (error) {
    return handleApiError(error);
  }
}
