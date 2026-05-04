import { connectToDatabase } from "../db/mongoose";
import { requireAccess } from "../access";
import { ConversationModel } from "../models/Conversation";
import { MessageModel } from "../models/Message";
import { ProductInstanceModel } from "../models/ProductInstance";

export async function getProjectStats(userId: string, projectSlug: string) {
  await connectToDatabase();
  const project = await requireAccess(userId, projectSlug);
  const projectId = String(project._id);

  const conversations = await ConversationModel.find({ projectId }).lean();
  const conversationIds = conversations.map((c) => String(c._id));

  const [totalMessages, aiMessages, productInstances] = await Promise.all([
    MessageModel.countDocuments({ conversationId: { $in: conversationIds } }),
    MessageModel.countDocuments({ conversationId: { $in: conversationIds }, role: "assistant" }),
    ProductInstanceModel.find({ projectId }).lean(),
  ]);

  // All conversations sorted newest first — no slice limit, UI scrolls
  const sorted = [...conversations].sort((a, b) => {
    const aTime = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
    const bTime = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
    return bTime - aTime;
  });

  const recentChats = sorted.map((c) => ({ id: String(c._id), title: c.title }));

  const integrationStatus = productInstances.map((pi) => ({
    name: pi.name,
    shopify: pi.integrations?.shopify?.enabled || false,
    crm: pi.integrations?.crm?.enabled || false,
  }));

  const activeIntegrations = productInstances.filter(
    (pi) => pi.integrations?.shopify?.enabled || pi.integrations?.crm?.enabled
  ).length;

  return {
    total_conversations: conversations.length,
    total_messages: totalMessages,
    ai_responses: aiMessages,
    active_integrations: activeIntegrations,
    recent_chats: recentChats,
    integrations: integrationStatus,
  };
}
