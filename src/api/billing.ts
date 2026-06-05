import type { PaymentMethod } from "../types";
import { apiClient } from "./client";
import { normalizeBill } from "./normalizers";

export async function getBillByTable(tableId: string, tableNumber?: number) {
  const { data } = await apiClient.get(`/billing/table/${tableId}`);
  return normalizeBill(data, tableNumber);
}

export async function generateBill(payload: {
  orderId: string;
  paymentMethod: PaymentMethod;
  tipAmount: number;
  splitCount?: number;
}) {
  const { data } = await apiClient.post("/billing/generate", payload);
  return normalizeBill(data);
}

export async function getBill(id: string) {
  const { data } = await apiClient.get(`/billing/${id}`);
  return normalizeBill(data);
}

export async function payBill(
  id: string,
  payload: {
    paymentMethod: PaymentMethod;
    tipAmount?: number;
    splitCount?: number;
  },
) {
  const { data } = await apiClient.post(`/billing/${id}/pay`, payload);
  return data;
}
