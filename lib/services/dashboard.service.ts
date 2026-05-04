import { requireAccess } from "../access";
import { DashboardConfigModel } from "../models/DashboardConfig";

export async function getDashboardConfig(userId: string, projectSlug: string) {
  const project = await requireAccess(userId, projectSlug);
  return DashboardConfigModel.findOne({ projectId: String(project._id) }).lean();
}

export async function updateDashboardConfig(userId: string, projectSlug: string, layout: any) {
  const project = await requireAccess(userId, projectSlug, 'admin');
  return DashboardConfigModel.findOneAndUpdate(
    { projectId: String(project._id) }, 
    { layout }, 
    { new: true }
  ).lean();
}
