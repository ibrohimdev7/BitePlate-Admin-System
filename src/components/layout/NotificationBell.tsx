import { Bell, Check } from "lucide-react";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { useSocketStore } from "../../store/socketStore";
import { formatTime } from "../../utils/format";

export function NotificationBell() {
  const notifications = useSocketStore((state) => state.notifications);
  const clearNotification = useSocketStore((state) => state.clearNotification);

  return (
    <div className="group relative">
      <Button variant="secondary" size="icon" aria-label="Notifications">
        <Bell className="h-4 w-4" />
      </Button>
      {notifications.length > 0 && (
        <span className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-red-600 px-1 text-center text-xs font-bold leading-5 text-white">
          {notifications.length}
        </span>
      )}
      <div className="invisible absolute right-0 top-12 z-20 w-80 rounded-lg border border-slate-200 bg-white p-3 opacity-0 shadow-soft transition group-hover:visible group-hover:opacity-100">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-semibold text-slate-950">Notifications</p>
          <Badge>{notifications.length}</Badge>
        </div>
        <div className="max-h-80 space-y-2 overflow-auto">
          {notifications.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No notifications</p>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{notification.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                    <p className="mt-2 text-xs text-slate-400">{formatTime(notification.createdAt)}</p>
                  </div>
                  <button
                    className="focus-ring rounded p-1 text-slate-500 hover:bg-slate-100"
                    type="button"
                    aria-label="Clear notification"
                    onClick={() => clearNotification(notification.id)}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
