import { useEffect } from "react";
import { queryClient } from "../queryClient";
import { useAuthStore } from "../store/authStore";
import { useSocketStore } from "../store/socketStore";
import type { RestaurantTable, TableStatus } from "../types";

export function useSocket() {
  const token = useAuthStore((state) => state.accessToken);
  const socketStore = useSocketStore();

  useEffect(() => {
    if (!token) {
      socketStore.disconnect();
      return;
    }

    socketStore.connect(token);
  }, [token]);

  useEffect(() => {
    const socket = socketStore.socket;
    if (!socket) return;

    const onOrderStatusChanged = ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
      if (newStatus === "IN_PROGRESS") {
        void queryClient.invalidateQueries({ queryKey: ["kitchen", "queue"] });
      }
      socketStore.addNotification({
        title: "Order status yangilandi",
        message: `${orderId} statusi ${newStatus} bo'ldi.`,
        tone: "info"
      });
    };

    const onKitchenOrderReady = ({ orderId, tableNumber }: { orderId: string; tableNumber?: number }) => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["kitchen", "queue"] });
      socketStore.addNotification({
        title: "Order tayyor",
        message: `${tableNumber ? `Table #${tableNumber}` : orderId} buyurtmasi tayyor.`,
        tone: "success"
      });
    };

    const onTableStatusChanged = ({ tableId, newStatus }: { tableId: string; newStatus: TableStatus }) => {
      queryClient.setQueriesData<RestaurantTable[]>({ queryKey: ["tables"] }, (old) =>
        old?.map((table) => (table.id === tableId ? { ...table, status: newStatus } : table))
      );
      socketStore.addNotification({
        title: "Stol statusi yangilandi",
        message: `${tableId} statusi ${newStatus} bo'ldi.`,
        tone: "info"
      });
    };

    const onReservationReminder = ({ customerName, tableNumber }: { customerName: string; tableNumber?: number }) => {
      void queryClient.invalidateQueries({ queryKey: ["reservations"] });
      socketStore.addNotification({
        title: "Bron eslatmasi",
        message: `${customerName}${tableNumber ? `, Table #${tableNumber}` : ""}.`,
        tone: "warning"
      });
    };

    const onAllergyAlert = ({ orderId, allergens, tableNumber }: { orderId: string; allergens: string[]; tableNumber?: number }) => {
      socketStore.addNotification({
        title: "Allergy alert",
        message: `${tableNumber ? `Table #${tableNumber}` : orderId}: ${allergens.join(", ")}`,
        tone: "danger"
      });
    };

    socket.on("order:status_changed", onOrderStatusChanged);
    socket.on("kitchen:order_ready", onKitchenOrderReady);
    socket.on("table:status_changed", onTableStatusChanged);
    socket.on("reservation:reminder", onReservationReminder);
    socket.on("allergy:alert", onAllergyAlert);

    return () => {
      socket.off("order:status_changed", onOrderStatusChanged);
      socket.off("kitchen:order_ready", onKitchenOrderReady);
      socket.off("table:status_changed", onTableStatusChanged);
      socket.off("reservation:reminder", onReservationReminder);
      socket.off("allergy:alert", onAllergyAlert);
    };
  }, [socketStore.socket]);

  return socketStore;
}
