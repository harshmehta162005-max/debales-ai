import { requireAccess } from "../access";
import { ProductInstanceModel } from "../models/ProductInstance";

export async function updateIntegrations(userId: string, projectSlug: string, piId: string, integrations: any) {
  const project = await requireAccess(userId, projectSlug, 'admin');
  return ProductInstanceModel.findOneAndUpdate(
    { _id: piId, projectId: String(project._id) },
    { integrations },
    { new: true }
  ).lean();
}
