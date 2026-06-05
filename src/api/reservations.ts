import { apiClient } from "./client";
import { normalizeReservation, unwrapList } from "./normalizers";

export interface ReservationsQuery {
  date?: string;
  tableId?: string;
}

export async function getReservations(
  branchId: string,
  params: ReservationsQuery = {},
) {
  const { data } = await apiClient.get(`/branches/${branchId}/reservations`, {
    params,
  });
  return unwrapList<any>(data).map(normalizeReservation);
}

export async function getUpcomingReservations() {
  const { data } = await apiClient.get("/reservations/upcoming");
  return unwrapList<any>(data).map(normalizeReservation);
}

export async function searchAvailableTables(
  branchId: string,
  params: { date: string; time: string; partySize: number },
) {
  const { data } = await apiClient.get(
    `/branches/${branchId}/reservations/search`,
    { params },
  );
  return unwrapList<any>(data);
}

export async function createReservation(payload: {
  guestName: string;
  guestPhone: string;
  tableId: string;
  scheduledAt: string;
  partySize: number;
  notes?: string;
}) {
  const { data } = await apiClient.post(`/reservations`, payload);
  return normalizeReservation(data);
}

export async function createStaffReservation(
  branchId: string,
  payload: {
    guestName: string;
    guestPhone: string;
    tableId?: string | number;
    scheduledAt: string;
    partySize: number;
    notes?: string;
  },
) {
  const body: any = { ...payload };
  if (body.tableId !== undefined && body.tableId !== null)
    body.tableId = String(body.tableId);
  const { data } = await apiClient.post(
    `/branches/${branchId}/reservations/staff`,
    body,
  );
  return normalizeReservation(data);
}

export async function modifyReservation(
  reservationId: string,
  data: Record<string, unknown>,
) {
  const { data: res } = await apiClient.patch(
    `/reservations/${reservationId}/modify`,
    data,
  );
  return res;
}

export async function confirmReservation(id: string) {
  const { data } = await apiClient.patch(`/reservations/${id}/confirm`);
  return normalizeReservation(data);
}

export async function cancelReservation(id: string, reason?: string) {
  const { data } = await apiClient.patch(`/reservations/${id}/cancel/staff`, {
    reason,
  });
  return normalizeReservation(data);
}
