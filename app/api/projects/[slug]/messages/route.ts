import { NextResponse } from "next/server";
import { getMessages, sendMessage } from "@/lib/services/message.service";
import { getSessionUserId } from "@/lib/utils/auth";
import { handleApiError } from "@/lib/utils/apiError";
import { connectToDatabase } from "@/lib/db/mongoose";
import { z } from "zod";

const sendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const conversationId = url.searchParams.get("conversationId");
    if (!conversationId)
      return NextResponse.json({ error: "conversationId required" }, { status: 400 });

    const { slug } = await params;
    const messages = await getMessages(userId, slug, conversationId);
    return NextResponse.json(messages);
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
    const body = await req.json();
    const parsed = sendMessageSchema.parse(body);

    const result = await sendMessage(userId, slug, parsed.conversationId, parsed.content);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
