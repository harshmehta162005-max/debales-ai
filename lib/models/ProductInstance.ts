import mongoose, { Schema, Document, Model } from "mongoose";
import { ProductInstance } from "@/types";

export interface IProductInstance extends ProductInstance, Document {}

const ProductInstanceSchema = new Schema<IProductInstance>(
  {
    projectId: { type: String, required: true, index: true },
    productType: { type: String, required: true },
    name: { type: String, required: true },
    integrations: {
      shopify: {
        enabled: { type: Boolean, default: false },
        mockData: { type: Schema.Types.Mixed },
      },
      crm: {
        enabled: { type: Boolean, default: false },
        mockData: { type: Schema.Types.Mixed },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { transform: (doc, ret: any) => { ret.id = ret._id; delete ret._id; delete ret.__v; } },
  }
);

export const ProductInstanceModel: Model<IProductInstance> = mongoose.models.ProductInstance || mongoose.model<IProductInstance>("ProductInstance", ProductInstanceSchema);
