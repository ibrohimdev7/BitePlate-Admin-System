import { useMemo, useState } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { createTable, deleteTable, updateTable } from "../api/tables";
import { Button } from "../components/common/Button";
import { ConfirmDeleteModal } from "../components/common/ConfirmDeleteModal";
import { Modal } from "../components/common/Modal";
import { Spinner } from "../components/common/Spinner";
import { PageWrapper } from "../components/layout/PageWrapper";
import { TableCard } from "../components/tables/TableCard";
import { TableStatusBadge } from "../components/tables/StatusBadge";
import {
  TableFormModal,
  type TableFormValues,
} from "../components/tables/TableFormModal";
import { useTables } from "../hooks/useTables";
import { queryClient } from "../queryClient";
import { useAuthStore } from "../store/authStore";
import type { RestaurantTable, TableStatus } from "../types";

const statuses: Array<TableStatus | "ALL"> = [
  "ALL",
  "FREE",
  "RESERVED",
  "OCCUPIED",
  "AWAITING_BILL",
  "CLEARED",
];

const canDeleteTable = (table: RestaurantTable) =>
  !table.currentOrderId && ["FREE", "CLEARED"].includes(table.status);

export function Tables() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const branchId = useAuthStore((state) => state.branchId);
  const [filter, setFilter] = useState<TableStatus | "ALL">("ALL");
  const [selected, setSelected] = useState<RestaurantTable | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RestaurantTable | null>(null);
  const [deleting, setDeleting] = useState<RestaurantTable | null>(null);
  const { data, isLoading } = useTables();
  const tables = data ?? [];
  const filtered = useMemo(
    () =>
      filter === "ALL"
        ? tables
        : tables.filter((table) => table.status === filter),
    [filter, tables],
  );
  const createMutation = useMutation({
    mutationFn: (values: TableFormValues) => createTable(branchId!, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tables", branchId] });
      setFormOpen(false);
    },
  });
  const updateMutation = useMutation({
    mutationFn: (values: TableFormValues) => updateTable(branchId!, editing!.id, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tables", branchId] });
      setEditing(null);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTable(branchId!, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tables", branchId] });
      setDeleting(null);
      setSelected(null);
    },
  });

  if (isLoading) return <Spinner />;

  return (
    <PageWrapper
      title={t("pages.tables.title")}
      subtitle={t("pages.tables.subtitle")}
      action={
        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setFormOpen(true)}
          disabled={!branchId}
        >
          {t("pages.tables.new")}
        </Button>
      }
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {statuses.map((status) => (
          <Button
            key={status}
            variant={filter === status ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {t(`status.table.${status}`)}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {filtered.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onSelect={setSelected}
            onNewOrder={(item) => navigate(`/orders/new?tableId=${item.id}`)}
          />
        ))}
      </div>
      <Modal
        title={selected ? `${t("pages.tables.table")} #${selected.number}` : t("pages.tables.table")}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-md bg-slate-50 p-4">
              <div>
                <p className="text-sm text-slate-500">{t("pages.tables.capacity")}</p>
                <p className="font-semibold text-slate-950">
                  {selected.capacity} {t("pages.tables.guests")}
                </p>
              </div>
              <TableStatusBadge status={selected.status} />
            </div>
            <p className="text-sm text-slate-600">
              {t("pages.tables.server")}: {selected.server ?? t("common.unassigned")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={selected.status !== "OCCUPIED"}
                onClick={() => navigate(`/orders/new?tableId=${selected.id}`)}
              >
                {t("pages.tables.newOrder")}
              </Button>
              <Button
                variant="secondary"
                icon={<Edit2 className="h-4 w-4" />}
                onClick={() => {
                  setEditing(selected);
                  setSelected(null);
                }}
              >
                {t("common.edit")}
              </Button>
              <Button
                variant="danger"
                icon={<Trash2 className="h-4 w-4" />}
                disabled={!canDeleteTable(selected)}
                onClick={() => setDeleting(selected)}
              >
                {t("common.delete")}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              {selected && !canDeleteTable(selected) ? t("pages.tables.deleteBlockedHint") : t("pages.tables.occupiedOrderHint")}
            </p>
          </div>
        )}
      </Modal>
      <TableFormModal
        open={formOpen}
        loading={createMutation.isPending}
        onClose={() => setFormOpen(false)}
        onSubmit={(values) => createMutation.mutate(values)}
      />
      <TableFormModal
        open={Boolean(editing)}
        table={editing}
        loading={updateMutation.isPending}
        onClose={() => setEditing(null)}
        onSubmit={(values) => updateMutation.mutate(values)}
      />
      <ConfirmDeleteModal
        open={Boolean(deleting)}
        title={deleting && !canDeleteTable(deleting) ? t("pages.tables.deleteBlockedTitle") : t("pages.tables.deleteTitle")}
        message={deleting && !canDeleteTable(deleting) ? t("pages.tables.deleteBlockedMessage") : t("pages.tables.deleteMessage", { number: deleting?.number ?? "" })}
        loading={deleteMutation.isPending}
        confirmDisabled={Boolean(deleting && !canDeleteTable(deleting))}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && canDeleteTable(deleting) && deleteMutation.mutate(deleting.id)}
      />
    </PageWrapper>
  );
}
