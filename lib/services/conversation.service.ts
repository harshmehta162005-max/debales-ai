import { requireAccess } from "../access";
import { ConversationModel } from "../models/Conversation";

export async function getConversations(userId: string, projectSlug: string) {
  const project = await requireAccess(userId, projectSlug);
  return ConversationModel.find({ projectId: String(project._id) }).lean();
}

export async function createConversation(userId: string, projectSlug: string, productInstanceId: string, title: string) {
  const project = await requireAccess(userId, projectSlug);
  return ConversationModel.create({ projectId: String(project._id), productInstanceId, title, createdByUserId: userId });
}
