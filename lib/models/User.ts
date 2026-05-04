import mongoose, { Schema, Document, Model } from "mongoose";
import { User } from "@/types";

export interface IUser extends User, Document {}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    projects: [
      {
        projectId: { type: String, required: true },
        role: { type: String, enum: ['admin', 'member'], required: true },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { transform: (doc, ret: any) => { ret.id = ret._id; delete ret._id; delete ret.__v; } },
  }
);

export const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
