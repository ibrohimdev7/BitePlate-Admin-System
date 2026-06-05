import type { RestaurantTable } from "../../types";
import { Button } from "../common/Button";
import { TableStatusBadge } from "./StatusBadge";
import { useTranslation } from "react-i18next";

interface TableCardProps {
  table: RestaurantTable;
  onSelect: (table: RestaurantTable) => void;
  onNewOrder: (table: RestaurantTable) => void;
}

export function TableCard({ table, onSelect, onNewOrder }: TableCardProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className="focus-ring rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
      onClick={() => onSelect(table)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{t("pages.tables.table")}</p>
          <p className="text-2xl font-bold text-slate-950">#{table.number}</p>
        </div>
        <TableStatusBadge status={table.status} />
      </div>
      <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
        <span>{table.capacity} {t("pages.tables.seats")}</span>
        <span>{table.server}</span>
      </div>
      <Button
        className="mt-4 w-full"
        variant={table.status === "OCCUPIED" ? "primary" : "secondary"}
        size="sm"
        onClick={(event) => {
          event.stopPropagation();
          if (table.status === "OCCUPIED") {
            onNewOrder(table);
          } else {
            onSelect(table);
          }
        }}
      >
        {table.status === "OCCUPIED" ? t("pages.tables.newOrder") : t("common.details")}
      </Button>
    </button>
  );
}
