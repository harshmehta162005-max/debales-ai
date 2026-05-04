import { NextResponse } from "next/server";
import { requireAccess } from "@/lib/access";
import { ProductInstanceModel } from "@/lib/models/ProductInstance";
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
    const project = await requireAccess(userId, slug);
    const instances = await ProductInstanceModel.find({
      projectId: String(project._id),
    }).lean();

    return NextResponse.json(instances);
  } catch (error) {
    return handleApiError(error);
  }
}
