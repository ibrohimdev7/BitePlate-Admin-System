import type { Order } from "../../types";
import { formatCurrency, formatTime } from "../../utils/format";
import { OrderStatusBadge } from "../tables/StatusBadge";

export function OrderCard({ order, onSelect }: { order: Order; onSelect: (order: Order) => void }) {
  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <button
      type="button"
      className="focus-ring w-full rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-soft"
      onClick={() => onSelect(order)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">Order {order.id}</p>
          <p className="text-sm text-slate-500">Table #{order.tableNumber} • {formatTime(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-3 text-sm text-slate-600">{order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}</p>
      <p className="mt-3 font-semibold text-forest-700">{formatCurrency(total)}</p>
    </button>
  );
}
