import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  NEXT_PUBLIC_BASE_URL: z.string().url("NEXT_PUBLIC_BASE_URL must be a valid URL"),
  AI_API_KEY: z.string().min(1, "AI_API_KEY is required"),
  SESSION_SECRET: z.string().min(1, "SESSION_SECRET is required"),
});

// Skip validation during Vercel build phase so the build doesn't crash before the app even runs
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1' && !process.env.MONGODB_URI;

export const env = isBuildPhase ? {
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/dummy",
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  AI_API_KEY: process.env.AI_API_KEY || "dummy",
  SESSION_SECRET: process.env.SESSION_SECRET || "dummy",
} as any : envSchema.parse({
  MONGODB_URI: process.env.MONGODB_URI,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  AI_API_KEY: process.env.AI_API_KEY,
  SESSION_SECRET: process.env.SESSION_SECRET,
});
