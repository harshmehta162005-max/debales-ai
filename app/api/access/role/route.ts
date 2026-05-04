import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/utils/auth";
import { ProjectModel } from "@/lib/models/Project";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const userId = await getSessionUserId(req);
    
    if (!userId) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // Check if the user is an admin for ANY project
    const adminProject = await ProjectModel.findOne({
      "members": {
        $elemMatch: { userId: userId, role: "admin" }
      }
    }).select("_id").lean();

    return NextResponse.json({ isAdmin: !!adminProject });
  } catch (error) {
    console.error("Error in access/role API:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
