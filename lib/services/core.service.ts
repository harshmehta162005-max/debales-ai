import { ProjectModel } from "../models/Project";
import { UserModel } from "../models/User";
import { connectToDatabase } from "../db/mongoose";

// Internal service methods without access checks, used purely by the access layer.
export async function getProjectBySlugInternal(slug: string) {
  await connectToDatabase();
  // { defaults: true } ensures Mongoose fills in schema defaults (e.g. setupComplete: false)
  // for documents that predate the field being added
  return ProjectModel.findOne({ slug }).lean({ defaults: true });
}

export async function getProjectByIdInternal(id: string) {
  await connectToDatabase();
  return ProjectModel.findById(id).lean({ defaults: true });
}

export async function getUserByIdInternal(id: string) {
  await connectToDatabase();
  return UserModel.findById(id).lean();
}
