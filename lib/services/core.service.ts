import { ProjectModel } from "../models/Project";
import { UserModel } from "../models/User";
import { connectToDatabase } from "../db/mongoose";

// Internal service methods without access checks, used purely by the access layer.
export async function getProjectBySlugInternal(slug: string) {
  await connectToDatabase();
  return ProjectModel.findOne({ slug }).lean();
}

export async function getProjectByIdInternal(id: string) {
  await connectToDatabase();
  return ProjectModel.findById(id).lean();
}

export async function getUserByIdInternal(id: string) {
  await connectToDatabase();
  return UserModel.findById(id).lean();
}
