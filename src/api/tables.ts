import type { TableStatus } from "../types";
import { apiClient } from "./client";
import { normalizeTable, unwrapList } from "./normalizers";

export interface TablesQuery {
  status?: TableStatus | TableStatus[];
  date?: string;
  partySize?: number;
}

export async function getTables(branchId: string, params: TablesQuery = {}) {
  const { data } = await apiClient.get(`/branches/${branchId}/tables`, {
    params: {
      ...params,
      status: Array.isArray(params.status) ? params.status.join(",") : params.status
    }
  });
  return unwrapList<any>(data).map(normalizeTable);
}

export async function getAvailableTables(branchId: string, params: { date?: string; time?: string; partySize?: number } = {}) {
  const { data } = await apiClient.get(`/branches/${branchId}/tables/available`, { params });
  return unwrapList<any>(data).map(normalizeTable);
}

export async function getTable(branchId: string, id: string) {
  const { data } = await apiClient.get(`/branches/${branchId}/tables/${id}`);
  return normalizeTable(data);
}

export async function updateTableStatus(branchId: string, id: string, status: TableStatus) {
  const { data } = await apiClient.patch(`/branches/${branchId}/tables/${id}/status`, { status });
  return normalizeTable(data);
}

export async function createTable(branchId: string, payload: { number: number; capacity: number }) {
  const { data } = await apiClient.post(`/branches/${branchId}/tables`, payload);
  return normalizeTable(data);
}

export async function updateTable(branchId: string, id: string, payload: { number: number; capacity: number }) {
  const { data } = await apiClient.patch(`/branches/${branchId}/tables/${id}`, payload);
  return normalizeTable(data);
}

export async function deleteTable(branchId: string, id: string) {
  const { data } = await apiClient.delete(`/branches/${branchId}/tables/${id}`);
  return data;
}
