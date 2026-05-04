import mongoose, { Schema, Document, Model } from "mongoose";
import { DashboardConfig } from "@/types";

export interface IDashboardConfig extends DashboardConfig, Document {}

const DashboardConfigSchema = new Schema<IDashboardConfig>(
  {
    projectId: { type: String, required: true, index: true },
    layout: [
      {
        id: { type: String, required: true },
        type: { type: String, enum: ['section', 'widget'], required: true },
        title: { type: String, required: true },
        widgets: [
          {
            type: { type: String, enum: ['stat', 'chart', 'list', 'table'], required: true },
            label: { type: String, required: true },
            valueKey: { type: String, required: true },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { transform: (doc, ret: any) => { ret.id = ret._id; delete ret._id; delete ret.__v; } },
  }
);

export const DashboardConfigModel: Model<IDashboardConfig> = mongoose.models.DashboardConfig || mongoose.model<IDashboardConfig>("DashboardConfig", DashboardConfigSchema);
