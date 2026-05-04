import mongoose, { Schema, Document, Model } from "mongoose";
import { Conversation } from "@/types";

export interface IConversation extends Conversation, Document {}

const ConversationSchema = new Schema<IConversation>(
  {
    projectId: { type: String, required: true, index: true },
    productInstanceId: { type: String, required: true },
    title: { type: String, required: true },
    createdByUserId: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { transform: (doc, ret: any) => { ret.id = ret._id; delete ret._id; delete ret.__v; } },
  }
);

export const ConversationModel: Model<IConversation> = mongoose.models.Conversation || mongoose.model<IConversation>("Conversation", ConversationSchema);
