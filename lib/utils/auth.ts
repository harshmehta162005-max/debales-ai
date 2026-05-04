import { auth } from "@clerk/nextjs/server";

export async function getSessionUserId(req?: Request): Promise<string | null> {
  // We can ignore the req parameter in App Router since auth() reads from context
  const { userId } = await auth();
  return userId;
}
