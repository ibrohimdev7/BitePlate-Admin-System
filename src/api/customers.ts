import { apiClient } from "./client";
import { normalizeCustomer, unwrapList } from "./normalizers";

export async function getCustomers(params: Record<string, unknown> = {}) {
  const { data } = await apiClient.get(`/customers`, { params });
  return unwrapList<any>(data).map(normalizeCustomer);
}

export async function getCustomer(id: string) {
  const { data } = await apiClient.get(`/customers/${id}`);
  return normalizeCustomer(data);
}

export async function createCustomer(payload: { name: string; phone: string; email?: string }) {
  const { data } = await apiClient.post(`/customers`, payload);
  return data;
}
