import { AlertTriangle, CheckCircle2, Flame, Play, RotateCcw, XCircle } from "lucide-react";
import type { Order } from "../../types";
import { formatTime } from "../../utils/format";
import { Button } from "../common/Button";
import { OrderStatusBadge } from "../tables/StatusBadge";

interface KitchenQueueProps {
  orders: Order[];
  onCommand: (orderId: string, command: string) => void;
}

export function KitchenQueue({ orders, onCommand }: KitchenQueueProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {orders.map((order) => (
        <article key={order.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Table #{order.tableNumber}</p>
              <h2 className="text-lg font-bold text-slate-950">{order.id}</h2>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
          {order.allergyAlert && (
            <div className="mt-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-800">
              <AlertTriangle className="h-4 w-4" />
              {order.allergyAlert}
            </div>
          )}
          <ul className="mt-4 space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                <span className="font-semibold">{item.quantity}x</span> {item.name}
                {item.notes && <span className="block text-slate-500">{item.notes}</span>}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-slate-500">Started {formatTime(order.createdAt)}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button size="sm" icon={<Play className="h-4 w-4" />} onClick={() => onCommand(order.id, "PREPARE")}>
              Prepare
            </Button>
            <Button size="sm" variant="secondary" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => onCommand(order.id, "READY")}>
              Ready
            </Button>
            <Button size="sm" variant="secondary" icon={<Flame className="h-4 w-4" />} onClick={() => onCommand(order.id, "EXPEDITE")}>
              Expedite
            </Button>
            <Button size="sm" variant="danger" icon={<XCircle className="h-4 w-4" />} onClick={() => onCommand(order.id, "CANCEL")}>
              Cancel
            </Button>
            <Button className="col-span-2" size="sm" variant="ghost" icon={<RotateCcw className="h-4 w-4" />} onClick={() => onCommand(order.id, "UNDO")}>
              Undo last action
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
