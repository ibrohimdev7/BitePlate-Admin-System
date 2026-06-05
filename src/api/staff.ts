import type { Role } from "../types";
import { apiClient } from "./client";
import { normalizeStaffUser, unwrapList } from "./normalizers";

export async function getStaff() {
  const { data } = await apiClient.get("/staff");
  return unwrapList<any>(data).map(normalizeStaffUser);
}

export async function getStaffMember(id: string) {
  const { data } = await apiClient.get(`/staff/${id}`);
  return normalizeStaffUser(data);
}

export async function createStaff(payload: {
  name: string;
  email: string;
  password: string;
  role: Role;
  branchId?: string;
}) {
  const { data } = await apiClient.post("/staff", payload);
  return normalizeStaffUser(data);
}

export async function updateStaff(
  id: string,
  payload: {
    name?: string;
    email?: string;
    password?: string;
    role?: Role;
    branchId?: string;
    isActive?: boolean;
  },
) {
  const { data } = await apiClient.patch(`/staff/${id}`, payload);
  return normalizeStaffUser(data);
}

export async function deactivateStaff(id: string) {
  const { data } = await apiClient.patch(`/staff/${id}`, { isActive: false });
  return normalizeStaffUser(data);
}

export async function deleteStaff(id: string) {
  const { data } = await apiClient.delete(`/staff/${id}`);
  return normalizeStaffUser(data);
}
