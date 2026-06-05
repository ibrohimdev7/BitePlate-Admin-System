import { useState } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  createStaffReservation,
  cancelReservation,
  getReservations,
  modifyReservation,
  searchAvailableTables,
} from "../api/reservations";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { ConfirmDeleteModal } from "../components/common/ConfirmDeleteModal";
import { Spinner } from "../components/common/Spinner";
import { PageWrapper } from "../components/layout/PageWrapper";
import { ModifyReservationModal } from "../components/reservations/ModifyReservationModal";
import { useTables } from "../hooks/useTables";
import { queryClient } from "../queryClient";
import { useAuthStore } from "../store/authStore";
import type { Reservation, RestaurantTable } from "../types";
import { formatDate, formatTime } from "../utils/format";

const reservationSchema = z.object({
  customerName: z.string().min(2, "Ism required"),
  phone: z.string().min(9, "Telefon required"),
  date: z.string().min(1, "Sana required"),
  time: z.string().min(1, "Vaqt required"),
  tableId: z.string().optional(),
  partySize: z.coerce.number().positive(),
  notes: z.string().optional(),
});

type ReservationValues = z.infer<typeof reservationSchema>;

export function Reservations() {
  const { t } = useTranslation();
  const branchId = useAuthStore((state) => state.branchId);
  const { data: tablesData = [], isLoading: tablesLoading } = useTables();
  const { data, isLoading } = useQuery({
    queryKey: ["reservations", branchId],
    queryFn: () => getReservations(branchId!),
    enabled: Boolean(branchId),
  });
  const [message, setMessage] = useState("");
  const [tableMessage, setTableMessage] = useState("");
  const [availableTables, setAvailableTables] = useState<RestaurantTable[]>([]);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState<Reservation | null>(null);
  const [modifyTables, setModifyTables] = useState<RestaurantTable[]>([]);
  const reservations = data ?? [];
  const tableOptions = availableTables.length ? availableTables : tablesData;
  const tableHint = availableTables.length
    ? t("pages.reservations.searchTablesResult")
    : t("pages.reservations.allTables");
  const createMutation = useMutation({
    mutationFn: (values: ReservationValues) => {
      const payload: any = {
        guestName: values.customerName,
        guestPhone: values.phone,
        scheduledAt: `${values.date}T${values.time}`,
        partySize: values.partySize,
        notes: values.notes,
      };
      if (values.tableId) payload.tableId = String(values.tableId);
      return createStaffReservation(branchId!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations", branchId] });
      setMessage(t("pages.reservations.created"));
      setTableMessage("");
      reset();
      setAvailableTables([]);
    },
    onError: (err: any) => {
      setMessage(
        err?.response?.data?.message ??
          err?.message ??
          "Bron yaratishda xatolik yuz berdi.",
      );
    },
  });
  const availableMutation = useMutation({
    mutationFn: (values: { date: string; time: string; partySize: number }) =>
      searchAvailableTables(branchId!, values),
    onSuccess: (tables) => {
      const list = tables as RestaurantTable[];
      setAvailableTables(list);
      setTableMessage(
        list.length ? "" : t("pages.reservations.noMatchingTables"),
      );
    },
    onError: () =>
      setTableMessage(t("pages.reservations.searchError")),
  });
  const modifySearchMutation = useMutation({
    mutationFn: (values: { date: string; time: string; partySize: number }) =>
      searchAvailableTables(branchId!, values),
    onSuccess: (tables) => setModifyTables(tables as RestaurantTable[]),
  });
  const modifyMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: { scheduledAt: string; partySize: number; tableId: string };
    }) => modifyReservation(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations", branchId] });
      setEditing(null);
      setModifyTables([]);
    },
  });
  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelReservation(id, "Cancelled by staff"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations", branchId] });
      setCancelling(null);
    },
  });
  const today = new Date().toISOString().slice(0, 10);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReservationValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { date: today, time: "19:00", partySize: 2 },
  });

  if (!branchId)
    return (
      <PageWrapper
        title={t("pages.reservations.title")}
        subtitle={t("pages.reservations.branchRequired")}
      >
        <div />
      </PageWrapper>
    );
  if (isLoading) return <Spinner />;

  const onSubmit = (values: ReservationValues) => {
    if (!values.tableId) {
      setTableMessage(t("pages.reservations.selectTable"));
      return;
    }
    setTableMessage("");
    createMutation.mutate(values);
  };

  return (
    <PageWrapper
      title={t("pages.reservations.title")}
      subtitle={t("pages.reservations.subtitle")}
    >
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h2 className="mb-4 font-bold text-slate-950">{t("pages.reservations.new")}</h2>
          {[
            ["customerName", t("pages.reservations.customerName")],
            ["phone", t("common.phone")],
            ["date", t("pages.reservations.date")],
            ["time", t("pages.reservations.time")],
            ["partySize", t("pages.reservations.partySize")],
            ["notes", t("pages.reservations.notes")],
          ].map(([name, label]) => (
            <label key={name} className="mb-3 block text-sm">
              <span className="font-semibold text-slate-700">{label}</span>
              <input
                className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
                type={
                  name === "date"
                    ? "date"
                    : name === "time"
                      ? "time"
                      : name === "partySize"
                        ? "number"
                        : "text"
                }
                {...register(name as keyof ReservationValues)}
              />
              {errors[name as keyof ReservationValues] && (
                <span className="text-xs text-red-600">
                  {String(
                    (errors[name as keyof ReservationValues] as any)?.message ??
                      "Required",
                  )}
                </span>
              )}
            </label>
          ))}
          <Button
            type="button"
            variant="secondary"
            className="mb-3"
            disabled={availableMutation.isPending}
            onClick={handleSubmit((values) =>
              availableMutation.mutate({
                date: values.date,
                time: values.time,
                partySize: values.partySize,
              }),
            )}
          >
            {availableMutation.isPending
              ? t("pages.reservations.searching")
              : t("pages.reservations.searchTables")}
          </Button>
          <label className="mb-3 block text-sm">
            <span className="font-semibold text-slate-700">{t("pages.reservations.table")}</span>
            <select
              className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
              {...register("tableId")}
            >
              <option value="">{t("pages.orders.selectTable")}</option>
              {tableOptions.map((table) => (
                <option key={table.id} value={String(table.id)}>
                  #{table.number} ({table.capacity} {t("pages.reservations.guests")})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">{tableHint}</p>
            {tablesLoading && (
              <span className="text-xs text-slate-500">
                {t("pages.reservations.loadingTables")}
              </span>
            )}
            {!tablesLoading && tableOptions.length === 0 && (
              <span className="text-xs text-amber-700">{t("pages.reservations.noTable")}</span>
            )}
            {tableMessage && (
              <span className="mt-1 block text-xs text-amber-700">
                {tableMessage}
              </span>
            )}
          </label>
          {availableTables.length > 0 && (
            <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <p className="font-semibold">{t("pages.reservations.foundTables", { count: availableTables.length })}</p>
              <p className="mt-1">
                {availableTables.map((table) => `#${table.number} (${table.capacity} ${t("pages.reservations.guests")})`).join(", ")}
              </p>
            </div>
          )}
          {message && (
            <p className="mb-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
              {message}
            </p>
          )}
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? t("pages.reservations.creating") : t("pages.reservations.create")}
          </Button>
        </form>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-slate-950">
            {t("pages.reservations.upcoming")}
          </h2>
          <div className="space-y-3">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex flex-col gap-3 rounded-md border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-950">
                    {reservation.customerName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatDate(reservation.time)} •{" "}
                    {formatTime(reservation.time)} • Table #
                    {reservation.tableNumber} • {reservation.partySize} {t("pages.reservations.guests")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge
                    tone={
                      reservation.status === "CONFIRMED" ? "green" : "yellow"
                    }
                  >
                    {t(`status.reservation.${reservation.status}`)}
                  </Badge>
                  <Badge tone={reservation.reminderSent ? "blue" : "slate"}>
                    {reservation.reminderSent ? t("pages.reservations.smsSent") : t("pages.reservations.noSms")}
                  </Badge>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditing(reservation)}
                  >
                    {t("pages.reservations.edit")}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={reservation.status === "CANCELLED"}
                    onClick={() => setCancelling(reservation)}
                  >
                    {t("pages.reservations.cancel")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <ModifyReservationModal
        open={Boolean(editing)}
        reservation={editing}
        availableTables={modifyTables}
        loading={modifyMutation.isPending}
        searching={modifySearchMutation.isPending}
        onClose={() => {
          setEditing(null);
          setModifyTables([]);
        }}
        onSearch={(values) => modifySearchMutation.mutate(values)}
        onSubmit={(values) =>
          editing && modifyMutation.mutate({ id: editing.id, values })
        }
      />
      <ConfirmDeleteModal
        open={Boolean(cancelling)}
        title={t("pages.reservations.cancelTitle")}
        message={t("pages.reservations.cancelMessage", { name: cancelling?.customerName ?? "" })}
        confirmLabel={t("pages.reservations.cancel")}
        loading={cancelMutation.isPending}
        onClose={() => setCancelling(null)}
        onConfirm={() => cancelling && cancelMutation.mutate(cancelling.id)}
      />
    </PageWrapper>
  );
}
