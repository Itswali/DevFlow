// lib/routes.ts

export const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up"];
export const AUTH_ROUTES = ["/sign-in", "/sign-up"];  // redirect if already logged in

// Routes that require a specific role
export const ROLE_PROTECTED_ROUTES: Record<string, string[]> = {
  "/admin":         ["admin"],
  "/admin/users":   ["admin"],
  "/dashboard":     ["admin", "user", "moderator"],
  "/moderator":     ["admin", "moderator"],
};

export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
export const DEFAULT_AUTH_REDIRECT = "/sign-in";
export const UNAUTHORIZED_REDIRECT = "/unauthorized";
