/**
 * Seed script — populates MongoDB with demo data for multiple tenants.
 * Usage: npx tsx scripts/seed.ts
 *
 * What it creates:
 *  - 2 tenants (acme-corp, beta-startup) each with admin user
 *  - 1 ProductInstance per project (with different integration toggles)
 *  - 1 DashboardConfig per project (4 widgets)
 *  - 2 Conversations + 4 Messages per project
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// ── Import models directly (not via barrel to avoid circular refs) ─────────
import { ProjectModel } from "../lib/models/Project";
import { UserModel } from "../lib/models/User";
import { ProductInstanceModel } from "../lib/models/ProductInstance";
import { ConversationModel } from "../lib/models/Conversation";
import { MessageModel } from "../lib/models/Message";
import { DashboardConfigModel } from "../lib/models/DashboardConfig";

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("❌  MONGODB_URI not set in .env.local");
  process.exit(1);
}

async function clearExisting() {
  await Promise.all([
    ProjectModel.deleteMany({ slug: { $in: ["acme-corp", "beta-startup"] } }),
    UserModel.deleteMany({ email: { $in: ["admin@acme.com", "admin@beta.com"] } }),
  ]);
}

async function seed() {
  console.log("🌱  Connecting to MongoDB…");
  await mongoose.connect(MONGO_URI!);
  console.log("✅  Connected.\n");

  await clearExisting();
  console.log("🧹  Cleared old seed data.\n");

  // ── Tenant 1: Acme Corp ───────────────────────────────────────────────
  const acmeUser = await UserModel.create({
    _id: "seed-user-acme",
    email: "admin@acme.com",
    name: "Acme Admin",
    projects: [],
  });

  const acmeProject = await ProjectModel.create({
    slug: "acme-corp",
    name: "Acme Corp",
    setupComplete: true,
    members: [{ userId: "seed-user-acme", role: "admin" }],
  } as any);

  acmeUser.projects.push({ projectId: String(acmeProject._id), role: "admin" } as any);
  await acmeUser.save();

  const acmePi = await ProductInstanceModel.create({
    projectId: String(acmeProject._id),
    name: "Acme Sales Assistant",
    productType: "e-commerce",
    integrations: {
      shopify: {
        enabled: true,
        mockData: { orders: 147, revenue: "$24,830", topProduct: "Premium Widget", pendingShipments: 12 },
      },
      crm: {
        enabled: false,
        mockData: {},
      },
    },
  } as any);

  await DashboardConfigModel.create({
    projectId: String(acmeProject._id),
    layout: [
      {
        id: "s1", type: "section", title: "Overview",
        widgets: [
          { type: "stat",  label: "Total Conversations", valueKey: "total_conversations" },
          { type: "chart", label: "Weekly Activity",     valueKey: "weekly_activity" },
        ],
      },
      {
        id: "s2", type: "section", title: "Details",
        widgets: [
          { type: "list",  label: "Recent Conversations",  valueKey: "recent_chats" },
          { type: "table", label: "Integration Status",    valueKey: "integrations" },
        ],
      },
    ],
  } as any);

  const acmeConv1 = await ConversationModel.create({
    projectId: String(acmeProject._id),
    productInstanceId: String(acmePi._id),
    title: "Product inquiry",
    createdByUserId: "seed-user-acme",
  } as any);

  const acmeConv2 = await ConversationModel.create({
    projectId: String(acmeProject._id),
    productInstanceId: String(acmePi._id),
    title: "Shopify order status",
    createdByUserId: "seed-user-acme",
  } as any);

  await MessageModel.insertMany([
    { conversationId: String(acmeConv1._id), role: "user",      content: "What are our best-selling products this month?" },
    { conversationId: String(acmeConv1._id), role: "assistant", content: "Based on Shopify data, your top seller is the Premium Widget with 147 orders this month, generating $24,830 in revenue.", steps: ["Calling Shopify API..."] },
    { conversationId: String(acmeConv2._id), role: "user",      content: "How many orders are pending shipment?" },
    { conversationId: String(acmeConv2._id), role: "assistant", content: "You currently have 12 orders pending shipment. I recommend prioritizing orders placed more than 3 days ago.", steps: ["Calling Shopify API..."] },
  ] as any);

  console.log("✅  Tenant 1 (Acme Corp) seeded.");

  // ── Tenant 2: Beta Startup ────────────────────────────────────────────
  const betaUser = await UserModel.create({
    _id: "seed-user-beta",
    email: "admin@beta.com",
    name: "Beta Admin",
    projects: [],
  });

  const betaProject = await ProjectModel.create({
    slug: "beta-startup",
    name: "Beta Startup",
    setupComplete: true,
    members: [{ userId: "seed-user-beta", role: "admin" }],
  } as any);

  betaUser.projects.push({ projectId: String(betaProject._id), role: "admin" } as any);
  await betaUser.save();

  const betaPi = await ProductInstanceModel.create({
    projectId: String(betaProject._id),
    name: "Beta Support Bot",
    productType: "support",
    integrations: {
      shopify: {
        enabled: false,
        mockData: {},
      },
      crm: {
        enabled: true,
        mockData: { tickets: 34, openLeads: 89, closedDeals: 23, satisfaction: "4.7/5" },
      },
    },
  } as any);

  await DashboardConfigModel.create({
    projectId: String(betaProject._id),
    layout: [
      {
        id: "s1", type: "section", title: "Support Overview",
        widgets: [
          { type: "stat",  label: "Total Conversations", valueKey: "total_conversations" },
          { type: "stat",  label: "AI Responses",        valueKey: "ai_responses" },
        ],
      },
      {
        id: "s2", type: "section", title: "Activity",
        widgets: [
          { type: "chart", label: "Weekly Activity",    valueKey: "weekly_activity" },
          { type: "list",  label: "Recent Chats",       valueKey: "recent_chats" },
        ],
      },
    ],
  } as any);

  const betaConv1 = await ConversationModel.create({
    projectId: String(betaProject._id),
    productInstanceId: String(betaPi._id),
    title: "CRM leads review",
    createdByUserId: "seed-user-beta",
  } as any);

  const betaConv2 = await ConversationModel.create({
    projectId: String(betaProject._id),
    productInstanceId: String(betaPi._id),
    title: "Support ticket summary",
    createdByUserId: "seed-user-beta",
  } as any);

  await MessageModel.insertMany([
    { conversationId: String(betaConv1._id), role: "user",      content: "How many open leads do we have?" },
    { conversationId: String(betaConv1._id), role: "assistant", content: "Your CRM shows 89 open leads. You've closed 23 deals this period with a customer satisfaction score of 4.7/5.", steps: ["Fetching CRM records..."] },
    { conversationId: String(betaConv2._id), role: "user",      content: "Summarise open support tickets." },
    { conversationId: String(betaConv2._id), role: "assistant", content: "There are currently 34 open support tickets. I recommend prioritising the 8 tickets marked as high-priority.", steps: ["Fetching CRM records..."] },
  ] as any);

  console.log("✅  Tenant 2 (Beta Startup) seeded.\n");

  console.log("🎉  Seed complete! Collections populated:");
  console.log("    Projects:          2 (acme-corp, beta-startup)");
  console.log("    Users:             2 (admin@acme.com, admin@beta.com)");
  console.log("    ProductInstances:  2 (Shopify ON for Acme, CRM ON for Beta)");
  console.log("    DashboardConfigs:  2 (different widget layouts per tenant)");
  console.log("    Conversations:     4");
  console.log("    Messages:          8");

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error("❌  Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
