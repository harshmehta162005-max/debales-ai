import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { env } from "./env";

const COOKIE_NAME = "debales-session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function sign(value: string): string {
  return createHmac("sha256", env.SESSION_SECRET).update(value).digest("hex");
}

function verify(value: string, sig: string): boolean {
  return sign(value) === sig;
}

export function encodeSession(userId: string): string {
  const sig = sign(userId);
  return Buffer.from(`${userId}.${sig}`).toString("base64");
}

export function decodeSession(cookie: string): string | null {
  try {
    const decoded = Buffer.from(cookie, "base64").toString("utf-8");
    const lastDot = decoded.lastIndexOf(".");
    const userId = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);
    if (!verify(userId, sig)) return null;
    return userId;
  } catch {
    return null;
  }
}

export function getSessionUserId(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return decodeSession(decodeURIComponent(match[1]));
}

export function setSessionCookie(res: NextResponse, userId: string): NextResponse {
  res.cookies.set(COOKIE_NAME, encodeSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}

export function clearSessionCookie(res: NextResponse): NextResponse {
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
