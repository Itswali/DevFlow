import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  ROLE_PROTECTED_ROUTES,
  DEFAULT_LOGIN_REDIRECT,
  DEFAULT_AUTH_REDIRECT,
  UNAUTHORIZED_REDIRECT,
} from "@/lib/routes";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow Better Auth's own API routes through
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow public routes without any auth check
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Get the full session (requires Node.js runtime)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If not logged in, redirect to sign-in
  if (!session) {
    return NextResponse.redirect(new URL(DEFAULT_AUTH_REDIRECT, request.url));
  }

  // If logged in and trying to access auth pages, redirect away
  if (AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));
  }

  // Check role-based access
  const userRole = session.user.role as string;

  for (const [routePrefix, allowedRoles] of Object.entries(ROLE_PROTECTED_ROUTES)) {
    if (pathname.startsWith(routePrefix)) {
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL(UNAUTHORIZED_REDIRECT, request.url));
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs", // required for auth.api.getSession
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
