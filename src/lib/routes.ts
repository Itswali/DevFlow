// lib/routes.ts

export const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up", "/unauthorized"];

export const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export const ROLE_PROTECTED_ROUTES: Record<string, string[]> = {
  "/admin/users":   ["admin"],
  "/admin":         ["admin"],
  "/moderator":     ["admin", "moderator"],
  "/dashboard":     ["admin", "user", "moderator"],
};

export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
export const DEFAULT_AUTH_REDIRECT  = "/sign-in";
export const UNAUTHORIZED_REDIRECT  = "/unauthorized";
