import type { OrderStatus } from "../types";
import { apiClient } from "./client";
import { normalizeOrder, unwrapList } from "./normalizers";

export interface OrdersQuery {
  status?: OrderStatus | OrderStatus[];
  tableId?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export async function getOrders(branchId: string, params: OrdersQuery = {}) {
  const { data } = await apiClient.get(`/branches/${branchId}/orders`, {
    params: {
      ...params,
      status: Array.isArray(params.status) ? params.status.join(",") : params.status
    }
  });
  return unwrapList<any>(data).map(normalizeOrder);
}

export async function getOrder(branchId: string, id: string) {
  const { data } = await apiClient.get(`/branches/${branchId}/orders/${id}`);
  return normalizeOrder(data);
}

export async function createOrder(branchId: string, payload: { tableId: string; guestCount?: number; guests: Array<{ guestNumber: number; guestLabel?: string; items: Array<{ menuItemId: string; quantity: number; customizations?: unknown; notes?: string }> }> }) {
  const { data } = await apiClient.post(`/branches/${branchId}/orders`, payload);
  return normalizeOrder(data);
}

export async function addGuestToOrder(orderId: string, data: { guestNumber?: number; guestLabel?: string }) {
  const { data: res } = await apiClient.post(`/orders/${orderId}/guests`, data);
  return res;
}

export async function updateGuestItems(orderId: string, guestId: string, data: { items: Array<{ menuItemId: string; quantity: number; customizations?: unknown }> }) {
  const { data: res } = await apiClient.patch(`/orders/${orderId}/guests/${guestId}/items`, data);
  return res;
}

export async function replaceMealItem(orderId: string, data: { guestOrderItemId: string; newMenuItemId: string }) {
  const { data: res } = await apiClient.patch(`/orders/${orderId}/items/replace`, data);
  return res;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { data } = await apiClient.patch(`/orders/${id}/status`, { status });
  return data;
}

export async function cancelOrder(id: string, reason?: string) {
  const { data } = await apiClient.patch(`/orders/${id}/cancel`, { reason });
  return data;
}
