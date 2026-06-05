import { apiClient } from "./client";
import { normalizeStaffUser } from "./normalizers";
import type { StaffUser } from "../types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: StaffUser;
  accessToken: string;
  refreshToken: string;
}

export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post("/auth/staff/login", payload);
  const responseData = data?.data ?? data;

  return {
    user: normalizeStaffUser(responseData.user),
    accessToken: responseData.accessToken,
    refreshToken: responseData.refreshToken,
  };
}

export async function refreshTokenApi(refreshToken: string): Promise<string> {
  const { data } = await apiClient.post("/auth/refresh", { refreshToken });
  return data?.data?.accessToken ?? data.accessToken;
}

export async function logoutApi(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function getMeApi(): Promise<StaffUser> {
  const { data } = await apiClient.get("/auth/me");
  return normalizeStaffUser(data?.data ?? data);
}
