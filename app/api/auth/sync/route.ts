import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";
import { ProjectModel } from "@/lib/models/Project";
import { DashboardConfigModel } from "@/lib/models/DashboardConfig";

export async function POST() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Check if user already exists
    let dbUser = await UserModel.findById(userId);

    if (!dbUser) {
      // 1. Create User
      const email = user.emailAddresses[0]?.emailAddress || "user@example.com";
      const name = user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : email.split("@")[0];

      dbUser = await UserModel.create({
        _id: userId,
        email,
        name,
        projects: [],
      });

      // 2. Create Default Project (setupComplete = false — triggers setup wizard)
      const slug = `workspace-${userId.substring(userId.length - 6).toLowerCase()}`;
      const project = await ProjectModel.create({
        name: "My Workspace",
        slug,
        setupComplete: false,
        members: [{ userId, role: "admin" }],
      });

      // 3. Link project to user
      dbUser.projects.push({ projectId: String(project._id), role: "admin" });
      await dbUser.save();

      // 4. Create a minimal dashboard config (no product instance yet — setup wizard handles it)
      await DashboardConfigModel.create({
        projectId: String(project._id),
        layout: [
          {
            id: "s1",
            type: "section",
            title: "Overview",
            widgets: [
              { type: "stat", label: "Total Conversations", valueKey: "total_conversations" },
              { type: "chart", label: "Weekly Activity", valueKey: "weekly_activity" },
            ],
          },
          {
            id: "s2",
            type: "section",
            title: "Details",
            widgets: [
              { type: "list", label: "Recent Conversations", valueKey: "recent_chats" },
              { type: "table", label: "Product Integrations", valueKey: "integrations" },
            ],
          },
        ],
      });
    }

    return NextResponse.json({ success: true, user: dbUser });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
