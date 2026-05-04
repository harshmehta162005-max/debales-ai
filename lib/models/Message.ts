import mongoose, { Schema, Document, Model } from "mongoose";
import { Message } from "@/types";

export interface IMessage extends Message, Document {}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    steps: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { transform: (doc, ret: any) => { ret.id = ret._id; delete ret._id; delete ret.__v; } },
  }
);

export const MessageModel: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
