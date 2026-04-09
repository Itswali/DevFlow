// Define all roles
export type Role = 'admin' | 'manager' | 'user' | 'guest';

// Define route permissions — which roles can access which paths
export const routePermissions: Record<string, Role[]> = {
  '/admin':          ['admin'],
  '/manager':        ['admin', 'manager'],
  '/dashboard':      ['admin', 'manager', 'user'],
  '/api/admin':      ['admin'],
  '/api/manager':    ['admin', 'manager'],
  '/api/dashboard':  ['admin', 'manager', 'user'],
};

// Helper: check if a role can access a path
export function canAccess(pathname: string, role: Role | null): boolean {
  // Find matching route (supports prefix matching)
  const matchedRoute = Object.keys(routePermissions).find((route) =>
    pathname.startsWith(route)
  );

  if (!matchedRoute) return true;

  if (!role) return false;

  return routePermissions[matchedRoute].includes(role);
}
