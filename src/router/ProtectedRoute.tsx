import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "../types";
import { useAuthStore } from "../store/authStore";
import { canAccess } from "../utils/roleCheck";

interface ProtectedRouteProps {
  allowed: Role[];
}

export function ProtectedRoute({ allowed }: ProtectedRouteProps) {
  const role = useAuthStore((state) => state.role);
  const accessToken = useAuthStore((state) => state.accessToken);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccess(role, allowed)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
