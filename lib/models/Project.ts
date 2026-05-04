import mongoose, { Schema, Document, Model } from "mongoose";
import { Project } from "@/types";

export interface IProject extends Project, Document {}

const ProjectSchema = new Schema<IProject>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    setupComplete: { type: Boolean, default: false },
    members: [
      {
        userId: { type: String, required: true },
        role: { type: String, enum: ['admin', 'member'], required: true },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { transform: (doc, ret: any) => { ret.id = ret._id; delete ret._id; delete ret.__v; } },
  }
);

export const ProjectModel: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
