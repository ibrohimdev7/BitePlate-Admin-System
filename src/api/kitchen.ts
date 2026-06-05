import { apiClient } from "./client";
import { normalizeOrder, unwrapList } from "./normalizers";

export async function getKitchenQueue() {
  const { data } = await apiClient.get("/kitchen/queue");
  return unwrapList<any>(data).map(normalizeOrder);
}

export async function sendKitchenCommand(payload: { type: "PREPARE" | "CANCEL" | "EXPEDITE"; orderId: string }) {
  const { data } = await apiClient.post("/kitchen/commands", payload);
  return data;
}

export async function undoKitchenCommand() {
  const { data } = await apiClient.post("/kitchen/undo");
  return data;
}

export async function getKitchenHistory(limit = 20) {
  const { data } = await apiClient.get("/kitchen/history", { params: { limit } });
  return unwrapList<any>(data);
}
