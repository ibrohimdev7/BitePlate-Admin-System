import { useQuery } from "@tanstack/react-query";
import { getOrders, type OrdersQuery } from "../api/orders";
import { useAuthStore } from "../store/authStore";

export function useOrders(params: OrdersQuery = {}) {
  const branchId = useAuthStore((state) => state.branchId);
  return useQuery({
    queryKey: ["orders", branchId, params],
    queryFn: () => getOrders(branchId!, params),
    enabled: Boolean(branchId)
  });
}
