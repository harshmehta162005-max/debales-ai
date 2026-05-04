import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";

export async function GET() {
  try {
    const db = await connectToDatabase();
    return NextResponse.json({
      status: "ok",
      dbConnected: db.connection.readyState === 1,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        dbConnected: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
