import { useEffect, useState } from "react";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import type { Reservation, RestaurantTable } from "../../types";
import { useTranslation } from "react-i18next";

export function ModifyReservationModal({
  open,
  reservation,
  availableTables,
  loading,
  searching,
  onClose,
  onSearch,
  onSubmit
}: {
  open: boolean;
  reservation: Reservation | null;
  availableTables: RestaurantTable[];
  loading?: boolean;
  searching?: boolean;
  onClose: () => void;
  onSearch: (values: { date: string; time: string; partySize: number }) => void;
  onSubmit: (values: { scheduledAt: string; partySize: number; tableId: string }) => void;
}) {
  const { t } = useTranslation();
  const initialDate = reservation?.time ? reservation.time.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const initialTime = reservation?.time ? reservation.time.slice(11, 16) : "19:00";
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [partySize, setPartySize] = useState(reservation?.partySize ?? 2);
  const [tableId, setTableId] = useState(reservation?.tableId ?? "");

  useEffect(() => {
    setDate(initialDate);
    setTime(initialTime);
    setPartySize(reservation?.partySize ?? 2);
    setTableId(reservation?.tableId ?? "");
  }, [initialDate, initialTime, reservation]);

  return (
    <Modal title={t("pages.reservations.modifyTitle")} open={open} onClose={onClose}>
      {reservation && (
        <div className="space-y-4">
          <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
            <p><span className="font-semibold">{t("pages.reservations.customer")}:</span> {reservation.customerName || "-"}</p>
            <p><span className="font-semibold">{t("common.phone")}:</span> {reservation.phone || "-"}</p>
            {reservation.notes && <p><span className="font-semibold">{t("pages.reservations.notes")}:</span> {reservation.notes}</p>}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm">
              <span className="font-semibold text-slate-700">{t("pages.reservations.newDate")}</span>
              <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-slate-700">{t("pages.reservations.newTime")}</span>
              <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-slate-700">{t("pages.reservations.partySize")}</span>
              <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" type="number" min={1} value={partySize} onChange={(event) => setPartySize(Number(event.target.value))} />
            </label>
          </div>
          <Button variant="secondary" disabled={searching} onClick={() => onSearch({ date, time, partySize })}>{searching ? t("pages.reservations.searching") : t("pages.reservations.updateTables")}</Button>
          <div className="space-y-2">
            {availableTables.length === 0 && (
              <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                {t("pages.reservations.noModifyTables")}
              </p>
            )}
            {availableTables.map((table) => (
              <label key={table.id} className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 p-3 text-sm hover:bg-slate-50">
                <input type="radio" name="modifyTable" value={table.id} checked={tableId === table.id} onChange={(event) => setTableId(event.target.value)} />
                <span>#{table.number} ({table.capacity} {t("pages.reservations.guests")})</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>{t("common.cancel")}</Button>
            <Button disabled={!tableId || loading} onClick={() => onSubmit({ scheduledAt: `${date}T${time}`, partySize, tableId })}>{loading ? t("common.saving") : t("common.save")}</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
