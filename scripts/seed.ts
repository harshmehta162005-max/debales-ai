import mongoose from "mongoose";
import { ProjectModel } from "../lib/models/Project";
import { UserModel } from "../lib/models/User";
import { ProductInstanceModel } from "../lib/models/ProductInstance";
import { ConversationModel } from "../lib/models/Conversation";
import { MessageModel } from "../lib/models/Message";
import { DashboardConfigModel } from "../lib/models/DashboardConfig";
import { env } from "../lib/utils/env";

async function seed() {
  console.log("Connecting to database...");
  await mongoose.connect(env.MONGODB_URI);
  console.log("Connected.");

  console.log("Clearing existing data...");
  await ProjectModel.deleteMany({});
  await UserModel.deleteMany({});
  await ProductInstanceModel.deleteMany({});
  await ConversationModel.deleteMany({});
  await MessageModel.deleteMany({});
  await DashboardConfigModel.deleteMany({});

  console.log("Seeding data...");

  // Users
  const user1 = await UserModel.create({ email: "admin@acme.com", name: "Acme Admin", projects: [] });
  const user2 = await UserModel.create({ email: "admin@beta.com", name: "Beta Admin", projects: [] });

  // Projects
  const project1 = await ProjectModel.create({
    slug: "acme-corp",
    name: "Acme Corp",
    members: [{ userId: user1.id, role: "admin" }]
  });
  const project2 = await ProjectModel.create({
    slug: "beta-startup",
    name: "Beta Startup",
    members: [{ userId: user2.id, role: "admin" }]
  });

  // Update Users with projects
  user1.projects.push({ projectId: project1.id, role: "admin" });
  await user1.save();
  user2.projects.push({ projectId: project2.id, role: "admin" });
  await user2.save();

  // Product Instances
  const pi1 = await ProductInstanceModel.create({
    projectId: project1.id,
    productType: "e-commerce",
    name: "Acme Storefront",
    integrations: { shopify: { enabled: true, mockData: { orders: 10 } }, crm: { enabled: false } }
  });
  const pi2 = await ProductInstanceModel.create({
    projectId: project1.id,
    productType: "support",
    name: "Acme Support",
    integrations: { shopify: { enabled: false }, crm: { enabled: true, mockData: { tickets: 5 } } }
  });

  const pi3 = await ProductInstanceModel.create({
    projectId: project2.id,
    productType: "saas",
    name: "Beta Dashboard",
    integrations: { shopify: { enabled: false }, crm: { enabled: false } }
  });
  const pi4 = await ProductInstanceModel.create({
    projectId: project2.id,
    productType: "analytics",
    name: "Beta Insights",
    integrations: { shopify: { enabled: true, mockData: {} }, crm: { enabled: true, mockData: {} } }
  });

  // Dashboard Configs
  const layout = [
    {
      id: "overview-section",
      type: "section" as const,
      title: "Overview",
      widgets: [
        { type: "stat" as const, label: "Total Conversations", valueKey: "total_conversations" },
        { type: "chart" as const, label: "Weekly Activity", valueKey: "ai_responses" },
      ]
    },
    {
      id: "details-section",
      type: "section" as const,
      title: "Details",
      widgets: [
        { type: "list" as const, label: "Recent Chats", valueKey: "recent_chats" },
        { type: "table" as const, label: "Integration Status", valueKey: "integrations" },
      ]
    }
  ];

  await DashboardConfigModel.create({ projectId: project1.id, layout });
  await DashboardConfigModel.create({ projectId: project2.id, layout });

  // Conversations & Messages
  const conv1 = await ConversationModel.create({ projectId: project1.id, productInstanceId: pi1.id, title: "Order Inquiry", createdByUserId: user1.id });
  await MessageModel.create({ conversationId: conv1.id, role: "user", content: "Where is my order?" });
  await MessageModel.create({ conversationId: conv1.id, role: "assistant", content: "Checking Shopify...", steps: ["Calling Shopify API..."] });

  const conv2 = await ConversationModel.create({ projectId: project1.id, productInstanceId: pi2.id, title: "Refund Request", createdByUserId: user1.id });
  await MessageModel.create({ conversationId: conv2.id, role: "user", content: "I want a refund." });
  await MessageModel.create({ conversationId: conv2.id, role: "assistant", content: "Checking CRM...", steps: ["Fetching CRM data..."] });

  const conv3 = await ConversationModel.create({ projectId: project2.id, productInstanceId: pi3.id, title: "Login Issue", createdByUserId: user2.id });
  await MessageModel.create({ conversationId: conv3.id, role: "user", content: "Cannot login." });
  await MessageModel.create({ conversationId: conv3.id, role: "assistant", content: "Please reset password." });

  const conv4 = await ConversationModel.create({ projectId: project2.id, productInstanceId: pi4.id, title: "Data Export", createdByUserId: user2.id });
  await MessageModel.create({ conversationId: conv4.id, role: "user", content: "Export data to CSV." });
  await MessageModel.create({ conversationId: conv4.id, role: "assistant", content: "Exporting...", steps: ["Processing data..."] });

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
