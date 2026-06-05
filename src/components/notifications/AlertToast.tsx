import { useSocketStore } from "../../store/socketStore";

export function AlertToast() {
  const notification = useSocketStore((state) => state.notifications[0]);
  const clearNotification = useSocketStore((state) => state.clearNotification);
  if (!notification) return null;
  const tone =
    notification.tone === "danger"
      ? "border-red-200 bg-red-50"
      : notification.tone === "warning"
        ? "border-amber-200 bg-amber-50"
        : notification.tone === "success"
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-white";

  return (
    <div className={`fixed bottom-5 right-5 z-40 max-w-sm rounded-lg border p-4 shadow-soft ${tone}`}>
      <button
        className="absolute right-3 top-2 text-slate-500 hover:text-slate-900"
        type="button"
        aria-label="Close notification"
        onClick={() => clearNotification(notification.id)}
      >
        x
      </button>
      <p className="text-sm font-semibold text-slate-950">{notification.title}</p>
      <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
    </div>
  );
}
