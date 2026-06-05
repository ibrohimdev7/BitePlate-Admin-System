import { Badge } from "../common/Badge";
import type { OrderStatus, TableStatus } from "../../types";
import { useTranslation } from "react-i18next";

const tableTone: Record<TableStatus, "green" | "blue" | "red" | "yellow" | "slate"> = {
  FREE: "green",
  RESERVED: "blue",
  OCCUPIED: "red",
  AWAITING_BILL: "yellow",
  CLEARED: "slate"
};

const orderTone: Record<OrderStatus, "green" | "blue" | "red" | "yellow" | "slate"> = {
  PENDING: "yellow",
  IN_PROGRESS: "blue",
  READY: "green",
  SERVED: "slate",
  CANCELLED: "red"
};

export function TableStatusBadge({ status }: { status: TableStatus }) {
  const { t } = useTranslation();
  return <Badge tone={tableTone[status]}>{t(`status.table.${status}`)}</Badge>;
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  return <Badge tone={orderTone[status]}>{t(`status.order.${status}`)}</Badge>;
}
