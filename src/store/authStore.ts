import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginApi, logoutApi, refreshTokenApi, type LoginPayload } from "../api/auth";
import type { Role, StaffUser } from "../types";

interface AuthState {
  user: StaffUser | null;
  accessToken: string | null;
  refreshTokenValue: string | null;
  role: Role | null;
  branchId: string | null;
  setBranchId: (id: string | null) => void;
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshTokenValue: null,
      role: null,
      branchId: null,
      setBranchId: (id: string | null) => set({ branchId: id }),
      login: async (credentials) => {
        const response = await loginApi(credentials);
        set({
          user: response.user,
          accessToken: response.accessToken,
          refreshTokenValue: response.refreshToken,
          role: response.user.role,
          branchId: response.user.role === 'SUPER_ADMIN' ? null : response.user.branchId ?? null
        });
      },
      logout: () => {
        const { accessToken } = get();
        set({ user: null, accessToken: null, refreshTokenValue: null, role: null, branchId: null });
        if (accessToken) {
          void logoutApi().catch(() => undefined);
        }
      },
      refreshToken: async () => {
        const { refreshTokenValue } = get();
        if (!refreshTokenValue) {
          set({ user: null, accessToken: null, refreshTokenValue: null, role: null, branchId: null });
          return;
        }
        const accessToken = await refreshTokenApi(refreshTokenValue);
        set({ accessToken });
      }
    }),
    {
      name: "biteplate-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshTokenValue: state.refreshTokenValue,
        role: state.role,
        branchId: state.branchId
      })
    }
  )
);
