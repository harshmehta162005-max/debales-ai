import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/sign-up(.*)',
  '/api/health',
  '/api/auth/sync'
]);

const isAuthRoute = createRouteMatcher(['/login(.*)', '/sign-up(.*)']);
const isDashboardRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  // If already logged in and hitting auth pages, bounce to workspaces
  if (userId && isAuthRoute(request)) {
    return NextResponse.redirect(new URL('/workspaces', request.url));
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // Server-side RBAC protection for dashboard
  if (userId && isDashboardRoute(request)) {
    try {
      const baseUrl = request.nextUrl.origin;
      // Fetch the role using the fast internal API
      const res = await fetch(`${baseUrl}/api/access/role`, {
        headers: request.headers, // Pass cookies for auth
      });
      
      if (res.ok) {
        const data = await res.json();
        if (!data.isAdmin) {
          return NextResponse.redirect(new URL('/workspaces', request.url));
        }
      } else {
        return NextResponse.redirect(new URL('/workspaces', request.url));
      }
    } catch (e) {
      console.error("Middleware fetch error", e);
      return NextResponse.redirect(new URL('/workspaces', request.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
