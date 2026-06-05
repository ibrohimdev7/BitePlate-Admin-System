import { useQuery } from "@tanstack/react-query";
import { getKitchenQueue } from "../api/kitchen";

export function useKitchen() {
  return useQuery({
    queryKey: ["kitchen", "queue"],
    queryFn: getKitchenQueue
  });
}
