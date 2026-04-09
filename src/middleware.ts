import { NextRequest, NextResponse } from "next/server";
import { canAccess, Role } from "./lib/rbac";
import { auth } from "./lib/auth";
export const runtime = "nodejs";


const PUBLIC_ROUTES = ['/login', '/register', '/api/auth/login', '/api/auth/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublic) return NextResponse.next();

  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (!canAccess(pathname, session.user.role as Role)) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', session.user.id);
  requestHeaders.set('x-user-role', session.user.role);
  requestHeaders.set('x-user-email', session.user.email);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

// Which routes this middleware applies to
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
