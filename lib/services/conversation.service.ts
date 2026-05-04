import { requireAccess } from "../access";
import { ConversationModel } from "../models/Conversation";

export async function getConversations(userId: string, projectSlug: string, piId?: string) {
  const project = await requireAccess(userId, projectSlug);
  const query: any = { projectId: String(project._id) };
  if (piId) query.productInstanceId = piId;
  return ConversationModel.find(query).lean();
}

export async function createConversation(userId: string, projectSlug: string, productInstanceId: string, title: string) {
  const project = await requireAccess(userId, projectSlug);
  return ConversationModel.create({ projectId: String(project._id), productInstanceId, title, createdByUserId: userId });
}
