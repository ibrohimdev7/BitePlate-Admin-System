import type { Role } from "../types";

export const routePermissions: Record<string, Role[]> = {
  "/dashboard": ["SUPER_ADMIN", "BRANCH_MANAGER"],
  "/branches": ["SUPER_ADMIN"],
  "/customers": ["SUPER_ADMIN", "BRANCH_MANAGER"],
  "/tables": ["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST", "SERVER", "CASHIER"],
  "/orders": ["SUPER_ADMIN", "SERVER"],
  "/orders/new": ["SUPER_ADMIN", "SERVER"],
  "/kitchen": ["SUPER_ADMIN", "SERVER"],
  "/menu": ["SUPER_ADMIN", "BRANCH_MANAGER"],
  "/billing": ["SUPER_ADMIN", "CASHIER"],
  "/reservations": ["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST"],
  "/reports": ["SUPER_ADMIN", "BRANCH_MANAGER"],
  "/staff": ["SUPER_ADMIN", "BRANCH_MANAGER"]
};

export function canAccess(role: Role | null, allowed: Role[]) {
  return Boolean(role && (role === "SUPER_ADMIN" || allowed.includes(role)));
}

export function defaultPathForRole(role: Role) {
  const paths: Record<Role, string> = {
    SUPER_ADMIN: "/dashboard",
    BRANCH_MANAGER: "/dashboard",
    RECEPTIONIST: "/reservations",
    SERVER: "/orders",
    CASHIER: "/billing"
  };
  return paths[role];
}
