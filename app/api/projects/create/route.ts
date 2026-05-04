import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ProjectModel } from "@/lib/models/Project";
import { ProductInstanceModel } from "@/lib/models/ProductInstance";
import { DashboardConfigModel } from "@/lib/models/DashboardConfig";
import { UserModel } from "@/lib/models/User";
import { z } from "zod";

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
  productName: z.string().min(1).max(80).optional().default("General Assistant"),
  productType: z.enum(["e-commerce", "support", "sales", "general"]).optional().default("general"),
  shopifyEnabled: z.boolean().optional().default(false),
  crmEnabled: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    const body = await req.json();
    const data = CreateProjectSchema.parse(body);

    // Check if slug is taken
    const existing = await ProjectModel.findOne({ slug: data.slug });
    if (existing) {
      return NextResponse.json({ error: "That workspace URL is already taken." }, { status: 409 });
    }

    // 1. Create Project
    const project = await ProjectModel.create({
      name: data.name,
      slug: data.slug,
      setupComplete: true, // Auto-complete setup since we create it directly
      members: [{ userId, role: "admin" }],
    } as any);

    // 2. Link to User
    const dbUser = await UserModel.findById(userId);
    if (dbUser) {
      dbUser.projects.push({ projectId: String(project._id), role: "admin" } as any);
      await dbUser.save();
    }

    // 3. Create Product Instance with user's choices
    await ProductInstanceModel.create({
      projectId: String(project._id),
      name: data.productName,
      productType: data.productType,
      integrations: {
        shopify: { enabled: data.shopifyEnabled, mockData: {} },
        crm: { enabled: data.crmEnabled, mockData: {} },
      },
    } as any);

    // 4. Create Default Dashboard Config
    await DashboardConfigModel.create({
      projectId: String(project._id),
      layout: [
        {
          id: "s1", type: "section", title: "Overview",
          widgets: [
            { type: "stat", label: "Total Conversations", valueKey: "total_conversations" },
            { type: "chart", label: "Weekly Activity", valueKey: "weekly_activity" },
          ],
        },
        {
          id: "s2", type: "section", title: "Details",
          widgets: [
            { type: "list", label: "Recent Conversations", valueKey: "recent_chats" },
            { type: "table", label: "Integration Status", valueKey: "integrations" },
          ],
        },
      ],
    } as any);

    return NextResponse.json({ success: true, slug: project.slug });
  } catch (error: any) {
    console.error("Project creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create workspace" }, { status: 500 });
  }
}
