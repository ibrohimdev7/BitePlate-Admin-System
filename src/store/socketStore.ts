import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import type { AppNotification } from "../types";

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  hasConnectionError: boolean;
  notifications: AppNotification[];
  connect: (token: string) => void;
  disconnect: () => void;
  addNotification: (notification: Omit<AppNotification, "id" | "createdAt">) => void;
  clearNotification: (id: string) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  hasConnectionError: false,
  notifications: [],
  connect: (token) => {
    if (get().socket) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_URL ?? "http://localhost:3001", {
      autoConnect: false,
      auth: { token }
    });

    socket.on("connect", () => {
      set({ isConnected: true, hasConnectionError: false });
      get().addNotification({
        title: "Real-time ulandi",
        message: "Stollar va orderlar yangilanishi kuzatilmoqda.",
        tone: "success"
      });
    });
    socket.on("disconnect", () => set({ isConnected: false, hasConnectionError: false }));
    socket.on("connect_error", () => {
      if (get().hasConnectionError) return;

      set({ hasConnectionError: true });
      get().addNotification({
        title: "Real-time ulanmagan",
        message: "Socket serverga ulanishda xatolik yuz berdi.",
        tone: "warning"
      });
    });

    set({ socket });
    socket.connect();
  },
  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, isConnected: false, hasConnectionError: false, notifications: [] });
  },
  addNotification: (notification) => {
    set((state) => ({
      notifications: [
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          ...notification
        },
        ...state.notifications
      ].slice(0, 20)
    }));
  },
  clearNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id)
    }));
  }
}));
