import { NextResponse } from "next/server";
import { getConversations, createConversation } from "@/lib/services/conversation.service";
import { getSessionUserId } from "@/lib/utils/auth";
import { handleApiError } from "@/lib/utils/apiError";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ConversationModel } from "@/lib/models/Conversation";
import { requireAccess } from "@/lib/access";
import { z } from "zod";

const createConvSchema = z.object({
  productInstanceId: z.string(),
  title: z.string(),
});

const patchConvSchema = z.object({
  conversationId: z.string(),
  title: z.string().min(1).max(100),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    const userId = getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const conversations = await getConversations(userId, slug);
    return NextResponse.json(conversations);
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
    const userId = getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const body = await req.json();
    const parsed = createConvSchema.parse(body);

    const conv = await createConversation(userId, slug, parsed.productInstanceId, parsed.title);
    return NextResponse.json(conv);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH — update conversation title (used for auto-naming after first message)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    const userId = getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    await requireAccess(userId, slug);

    const body = await req.json();
    const { conversationId, title } = patchConvSchema.parse(body);

    const updated = await ConversationModel.findByIdAndUpdate(
      conversationId,
      { title },
      { new: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
