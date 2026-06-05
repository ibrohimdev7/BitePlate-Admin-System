import { useQuery } from "@tanstack/react-query";
import { getTables, type TablesQuery } from "../api/tables";
import { useAuthStore } from "../store/authStore";

export function useTables(params: TablesQuery = {}) {
  const branchId = useAuthStore((state) => state.branchId);
  return useQuery({
    queryKey: ["tables", branchId, params],
    queryFn: () => getTables(branchId!, params),
    enabled: Boolean(branchId)
  });
}
