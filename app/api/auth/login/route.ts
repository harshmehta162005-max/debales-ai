import { NextResponse } from "next/server";
import { UserModel } from "@/lib/models/User";
import { connectToDatabase } from "@/lib/db/mongoose";
import { setSessionCookie } from "@/lib/utils/auth";
import { handleApiError } from "@/lib/utils/apiError";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email } = await req.json();
    const user = await UserModel.findOne({ email }).lean();

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please run the seed script first." },
        { status: 404 }
      );
    }

    const userId = String(user._id);
    const res = NextResponse.json({ userId, name: user.name, email: user.email });
    return setSessionCookie(res, userId);
  } catch (error) {
    return handleApiError(error);
  }
}
