import mongoose, { Schema, Document, Model } from "mongoose";
import { User } from "@/types";

export interface IUser extends Omit<User, 'id'>, Document<string> { _id: string; }

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
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

// Delete cached model so schema changes (like _id: String) always take effect on restart
delete (mongoose as any).models.User;
export const UserModel: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
