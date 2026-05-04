import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/utils/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  return clearSessionCookie(res);
}
