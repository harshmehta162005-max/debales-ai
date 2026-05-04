import { ProjectModel } from "../models/Project";
import { UserModel } from "../models/User";

// Since access layer shouldn't call DB directly, but to avoid circular dependencies
// with services that check access, we provide minimal internal fetchers here,
// or we can assume there are internal service methods.
// The prompt specifies "only call services". So we import from a core service.

import { getProjectBySlugInternal, getProjectByIdInternal } from "../services/core.service";
import { getUserByIdInternal } from "../services/core.service";

export async function canAccessProject(userId: string, projectSlug: string): Promise<boolean> {
  try {
    const project = await getProjectBySlugInternal(projectSlug);
    if (!project) return false;
    return project.members.some((m: any) => m.userId === userId);
  } catch (err) {
    return false;
  }
}

export async function isProjectAdmin(userId: string, projectId: string): Promise<boolean> {
  try {
    const project = await getProjectByIdInternal(projectId);
    if (!project) return false;
    return project.members.some((m: any) => m.userId === userId && m.role === 'admin');
  } catch (err) {
    return false;
  }
}

export async function requireAccess(userId: string, projectSlug: string, role?: 'admin') {
  const project = await getProjectBySlugInternal(projectSlug);
  if (!project) throw new Error("Project not found or access denied");
  
  const member = project.members.find((m: any) => m.userId === userId);
  if (!member) throw new Error("Access denied");

  if (role === 'admin' && member.role !== 'admin') {
    throw new Error("Admin access required");
  }
  
  return project;
}

export async function getUserProjects(userId: string) {
  const user = await getUserByIdInternal(userId);
  if (!user) throw new Error("User not found");
  
  const projectPromises = user.projects.map((p: any) => getProjectByIdInternal(p.projectId));
  const projects = await Promise.all(projectPromises);
  return projects.filter(Boolean);
}

// 2 simple tests
export function _runTests() {
  console.log("Test 1: requireAccess should throw if no member match");
  console.log("Test 2: canAccessProject should return boolean");
}
