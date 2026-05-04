import { requireAccess } from "../access";
import { MessageModel } from "../models/Message";
import { aiService } from "./ai.service";
import { connectToDatabase } from "../db/mongoose";

export async function getMessages(userId: string, projectSlug: string, conversationId: string) {
  await connectToDatabase();
  await requireAccess(userId, projectSlug);
  return MessageModel.find({ conversationId }).sort({ createdAt: 1 }).lean();
}

export async function sendMessage(
  userId: string,
  projectSlug: string,
  conversationId: string,
  content: string
) {
  await connectToDatabase();
  await requireAccess(userId, projectSlug);

  // Save user message first
  const userMsg = await MessageModel.create({
    conversationId,
    role: "user",
    content,
  });

  // Call AI — this may take a few seconds (Gemini)
  const aiResponse = await aiService.generateResponse(projectSlug, conversationId, content);

  // Save assistant message
  const assistantMsg = await MessageModel.create({
    conversationId,
    role: "assistant",
    content: aiResponse.content,
    steps: aiResponse.steps,
  });

  return {
    userMsg: { ...userMsg.toObject(), _id: String(userMsg._id) },
    assistantMsg: { ...assistantMsg.toObject(), _id: String(assistantMsg._id) },
  };
}
