import { apiClient } from "./client";
import { normalizeBranch, unwrapList } from "./normalizers";

export async function getBranches() {
  const { data } = await apiClient.get("/branches");
  return unwrapList<any>(data).map(normalizeBranch);
}

export async function getBranch(id: string) {
  const { data } = await apiClient.get(`/branches/${id}`);
  return normalizeBranch(data);
}

export async function createBranch(payload: {
  name: string;
  address: string;
  phone: string;
  isActive?: boolean;
}) {
  const { data } = await apiClient.post(`/branches`, payload);
  return normalizeBranch(data);
}

export async function updateBranch(
  id: string,
  payload: {
    name?: string;
    address?: string;
    phone?: string;
    isActive?: boolean;
  },
) {
  const { data } = await apiClient.patch(`/branches/${id}`, payload);
  return normalizeBranch(data);
}

export async function deleteBranch(id: string) {
  const { data } = await apiClient.delete(`/branches/${id}`);
  return data;
}
