import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/utils/auth";
import { UserModel } from "@/lib/models/User";
import { connectToDatabase } from "@/lib/db/mongoose";
import { handleApiError } from "@/lib/utils/apiError";

export async function GET(req: Request) {
  try {
    const userId = getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const user = await UserModel.findById(userId).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      userId: String(user._id),
      name: user.name,
      email: user.email,
      projects: user.projects,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
