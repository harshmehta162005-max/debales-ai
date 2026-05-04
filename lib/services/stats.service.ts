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

  // All conversations sorted newest first
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

  // ── Weekly activity: real message counts per day for the last 7 days ──────
  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();

  // Build ordered array of last 7 days (oldest → newest)
  const last7Days: { day: string; date: Date }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    last7Days.push({ day: DAY_NAMES[d.getDay()], date: d });
  }

  const sevenDaysAgo = new Date(last7Days[0].date);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Fetch all messages created in the past 7 days for this project
  const recentMessages = await MessageModel.find({
    conversationId: { $in: conversationIds },
    createdAt: { $gte: sevenDaysAgo },
  })
    .select("createdAt")
    .lean();

  // Bucket by calendar date key
  const dayCounts: Record<string, number> = {};
  for (const msg of recentMessages) {
    const d = new Date((msg as any).createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    dayCounts[key] = (dayCounts[key] || 0) + 1;
  }

  const weekly_activity = last7Days.map(({ day, date }) => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return { day, v: dayCounts[key] ?? 0 };
  });

  return {
    total_conversations: conversations.length,
    total_messages: totalMessages,
    ai_responses: aiMessages,
    active_integrations: activeIntegrations,
    recent_chats: recentChats,
    integrations: integrationStatus,
    weekly_activity,
  };
}
