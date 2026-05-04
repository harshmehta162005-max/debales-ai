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
    const userId = await getSessionUserId(req);
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

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const project = await requireAccess(userId, slug);
    const body = await req.json();

    const newInstance = await ProductInstanceModel.create({
      projectId: String(project._id),
      name: body.name || "New Product",
      productType: "general",
      integrations: {
        shopify: { enabled: false, mockData: {} },
        crm: { enabled: false, mockData: {} }
      }
    });

    return NextResponse.json(newInstance);
  } catch (error) {
    return handleApiError(error);
  }
}
