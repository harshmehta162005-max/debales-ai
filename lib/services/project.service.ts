import { requireAccess } from "../access";
import { ProjectModel } from "../models/Project";
import { ProjectSchema } from "../validations";

export async function getProject(userId: string, projectSlug: string) {
  const project = await requireAccess(userId, projectSlug);
  return project;
}

export async function createProject(userId: string, data: any) {
  const parsed = ProjectSchema.parse(data);
  const project = await ProjectModel.create(parsed);
  return project;
}
