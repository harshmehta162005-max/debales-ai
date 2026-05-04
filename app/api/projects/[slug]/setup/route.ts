import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ProjectModel } from "@/lib/models/Project";
import { ProductInstanceModel } from "@/lib/models/ProductInstance";
import { UserModel } from "@/lib/models/User";
import { z } from "zod";

const SetupSchema = z.object({
  companyName: z.string().min(1).max(80),
  newSlug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
  productName: z.string().min(1).max(80),
  productType: z.enum(["e-commerce", "support", "sales", "general"]),
  shopifyEnabled: z.boolean().default(false),
  crmEnabled: z.boolean().default(false),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    const { slug } = await params;
    const body = await req.json();
    const data = SetupSchema.parse(body);

    // Find the project by current slug and verify ownership
    const project = await ProjectModel.findOne({ slug });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const isMember = project.members.some((m: any) => String(m.userId) === userId && m.role === "admin");
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Check if new slug is already taken (by another project)
    if (data.newSlug !== slug) {
      const existing = await ProjectModel.findOne({ slug: data.newSlug });
      if (existing) {
        return NextResponse.json({ error: "That workspace URL is already taken. Please choose another." }, { status: 409 });
      }
    }

    // Update project name + slug + mark setup complete using direct update
    // This bypasses any Mongoose document hydration issues for fields that didn't exist
    await ProjectModel.updateOne(
      { _id: project._id },
      { $set: { 
          name: data.companyName, 
          slug: data.newSlug, 
          setupComplete: true 
      } }
    );

    // Update user's project reference if slug changed
    if (data.newSlug !== slug) {
      await UserModel.updateOne(
        { _id: userId },
        { $set: { "projects.$[].projectId": String(project._id) } }
      );
    }

    // Upsert product instance — prevents duplicates if setup was re-run
    // (was happening due to the redirect loop bug)
    await ProductInstanceModel.findOneAndUpdate(
      { projectId: String(project._id) },   // match: this project
      {
        $set: {
          name: data.productName,
          productType: data.productType,
          integrations: {
            shopify: {
              enabled: data.shopifyEnabled,
              mockData: data.shopifyEnabled ? {
                orders: 147,
                revenue: "$24,830",
                topProduct: "Premium Widget",
                pendingShipments: 12,
              } : {},
            },
            crm: {
              enabled: data.crmEnabled,
              mockData: data.crmEnabled ? {
                tickets: 34,
                openLeads: 89,
                closedDeals: 23,
                satisfaction: "4.7/5",
              } : {},
            },
          },
        },
      },
      { upsert: true, new: true }            // create if not exists, return new doc
    );

    return NextResponse.json({ success: true, newSlug: data.newSlug });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    console.error("Setup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
