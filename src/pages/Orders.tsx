import { useMemo, useState } from "react";
import { Search, Send } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getMenuItems } from "../api/menu";
import { createOrder, replaceMealItem, updateOrderStatus } from "../api/orders";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { Spinner } from "../components/common/Spinner";
import { PageWrapper } from "../components/layout/PageWrapper";
import { OrderCard } from "../components/orders/OrderCard";
import { ReplaceMealModal } from "../components/orders/ReplaceMealModal";
import { OrderStatusBadge } from "../components/tables/StatusBadge";
import { useOrders } from "../hooks/useOrders";
import { useTables } from "../hooks/useTables";
import { queryClient } from "../queryClient";
import { useAuthStore } from "../store/authStore";
import type { MenuItem, Order, OrderItem, OrderStatus } from "../types";
import { formatCurrency, formatTime } from "../utils/format";

const orderStatuses: Array<OrderStatus | "ALL"> = ["ALL", "PENDING", "IN_PROGRESS", "READY", "SERVED"];

export function Orders({ initialMode }: { initialMode?: "new" }) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const branchId = useAuthStore((state) => state.branchId);
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const [selected, setSelected] = useState<Order | null>(null);
  const [replaceItem, setReplaceItem] = useState<OrderItem | null>(null);
  const [query, setQuery] = useState("");
  const [tableId, setTableId] = useState(searchParams.get("tableId") ?? "");
  const [guestCount, setGuestCount] = useState(initialMode ? 3 : 2);
  const [guests, setGuests] = useState<Array<{ guestNumber: number; guestLabel: string; items: Array<{ menuItem: MenuItem; quantity: number }> }>>([
    { guestNumber: 1, guestLabel: t("pages.orders.guest", { number: 1 }), items: [] },
    { guestNumber: 2, guestLabel: t("pages.orders.guest", { number: 2 }), items: [] }
  ]);
  const ordersQuery = useOrders();
  const tablesQuery = useTables({ status: ["FREE", "OCCUPIED"] });
  const menuQuery = useQuery({ queryKey: ["menu", branchId], queryFn: () => getMenuItems(branchId!), enabled: Boolean(branchId) });
  const orders = ordersQuery.data ?? [];
  const tables = tablesQuery.data ?? [];
  const menu = menuQuery.data ?? [];
  const filteredOrders = useMemo(() => (status === "ALL" ? orders : orders.filter((order) => order.status === status)), [orders, status]);
  const filteredMenu = menu.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) || (item.sectionName ?? item.category).toLowerCase().includes(query.toLowerCase()));
  const draftTotal = guests.reduce((sum, guest) => sum + guest.items.reduce((guestSum, item) => guestSum + item.menuItem.price * item.quantity, 0), 0);
  const createMutation = useMutation({
    mutationFn: () => createOrder(branchId!, {
      tableId,
      guestCount: guests.length,
      guests: guests.map((guest) => ({
        guestNumber: guest.guestNumber,
        guestLabel: guest.guestLabel,
        items: guest.items.map((item) => ({ menuItemId: item.menuItem.id, quantity: item.quantity }))
      }))
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", branchId] });
      setGuests([{ guestNumber: 1, guestLabel: t("pages.orders.guest", { number: 1 }), items: [] }, { guestNumber: 2, guestLabel: t("pages.orders.guest", { number: 2 }), items: [] }]);
    }
  });
  const replaceMutation = useMutation({
    mutationFn: ({ orderId, guestOrderItemId, newMenuItemId }: { orderId: string; guestOrderItemId: string; newMenuItemId: string }) => replaceMealItem(orderId, { guestOrderItemId, newMenuItemId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", branchId] });
      setReplaceItem(null);
    }
  });
  const sendToKitchenMutation = useMutation({
    mutationFn: async () => {
      const pending = orders.filter((order) => order.status === "PENDING");
      await Promise.all(pending.map((order) => updateOrderStatus(order.id, "IN_PROGRESS")));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders", branchId] }),
  });

  const syncGuestCount = (count: number) => {
    setGuestCount(count);
    setGuests((current) => Array.from({ length: count }, (_, index) => current[index] ?? { guestNumber: index + 1, guestLabel: t("pages.orders.guest", { number: index + 1 }), items: [] }));
  };
  const addItemToGuest = (guestNumber: number, item: MenuItem) => {
    setGuests((current) => current.map((guest) => guest.guestNumber === guestNumber ? {
      ...guest,
      items: guest.items.some((draft) => draft.menuItem.id === item.id)
        ? guest.items.map((draft) => draft.menuItem.id === item.id ? { ...draft, quantity: draft.quantity + 1 } : draft)
        : [...guest.items, { menuItem: item, quantity: 1 }]
    } : guest));
  };

  if (!branchId) return <PageWrapper title={t("pages.orders.title")} subtitle={t("pages.orders.branchRequired")}><div /></PageWrapper>;
  if (ordersQuery.isLoading || menuQuery.isLoading || tablesQuery.isLoading) return <Spinner />;

  return (
    <PageWrapper
      title={t("pages.orders.title")}
      subtitle={t("pages.orders.subtitle")}
      action={
        <Button
          icon={<Send className="h-4 w-4" />}
          disabled={!orders.some((order) => order.status === "PENDING") || sendToKitchenMutation.isPending}
          onClick={() => sendToKitchenMutation.mutate()}
        >
          {sendToKitchenMutation.isPending ? "Yuborilmoqda..." : t("pages.orders.sendKitchen")}
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">{t("pages.orders.newOrder")}</h2>
          <label className="mt-4 block text-sm">
            <span className="font-semibold text-slate-700">{t("pages.orders.table")}</span>
            <select className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" value={tableId} onChange={(event) => setTableId(event.target.value)}>
              <option value="">{t("pages.orders.selectTable")}</option>
              {tables.map((table) => <option key={table.id} value={table.id}>{t("pages.orders.table")} #{table.number}</option>)}
            </select>
          </label>
          <label className="mt-4 block text-sm">
            <span className="font-semibold text-slate-700">{t("pages.orders.guestsCount")}</span>
            <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" type="number" min={1} value={guestCount} onChange={(event) => syncGuestCount(Number(event.target.value))} />
          </label>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              className="focus-ring w-full rounded-md border border-slate-200 py-2 pl-9 pr-3"
              placeholder={t("pages.orders.searchMenu")}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="mt-4 max-h-96 space-y-2 overflow-auto">
            {filteredMenu.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-md bg-slate-50 p-3">
                <img className="h-12 w-12 rounded-md object-cover" src={item.image} alt="" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-950">{item.name}</p>
                  <p className="text-sm text-slate-500">{formatCurrency(item.price)}</p>
                </div>
                <select className="focus-ring rounded-md border border-slate-200 px-2 py-1 text-sm" onChange={(event) => event.target.value && addItemToGuest(Number(event.target.value), item)} value="">
                  <option value="">{t("pages.orders.add")}</option>
                  {guests.map((guest) => <option key={guest.guestNumber} value={guest.guestNumber}>{t("pages.orders.guest", { number: guest.guestNumber })}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {guests.map((guest) => (
              <div key={guest.guestNumber} className="rounded-md border border-slate-200 p-3">
                <p className="font-semibold text-slate-950">{t("pages.orders.guest", { number: guest.guestNumber })}</p>
                {guest.items.length === 0 ? <p className="mt-1 text-sm text-slate-500">{t("pages.orders.notSelected")}</p> : guest.items.map((item) => (
                  <p key={item.menuItem.id} className="mt-1 flex justify-between text-sm text-slate-600"><span>{item.menuItem.name} x{item.quantity}</span><span>{formatCurrency(item.menuItem.price * item.quantity)}</span></p>
                ))}
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={() => syncGuestCount(guestCount + 1)}>{t("pages.orders.addGuest")}</Button>
          </div>
          <div className="mt-4 rounded-md bg-forest-50 p-4 text-forest-900">
            <p className="text-sm font-semibold">{t("pages.orders.draftTotal")}</p>
            <p className="text-2xl font-bold">{formatCurrency(draftTotal)}</p>
          </div>
          <Button className="mt-4 w-full" disabled={!tableId || createMutation.isPending} onClick={() => createMutation.mutate()}>{createMutation.isPending ? t("pages.orders.submitting") : t("pages.orders.submit")}</Button>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap gap-2">
            {orderStatuses.map((item) => (
              <Button key={item} variant={status === item ? "primary" : "secondary"} size="sm" onClick={() => setStatus(item)}>
                {t(`status.order.${item}`)}
              </Button>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} onSelect={setSelected} />
            ))}
          </div>
        </section>
      </div>

      <Modal title={selected ? `${t("pages.orders.order")} ${selected.id}` : t("pages.orders.order")} open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-md bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">{t("pages.orders.table")} #{selected.tableNumber}</p>
              <OrderStatusBadge status={selected.status} />
            </div>
            {selected.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                  <Button size="sm" variant="secondary" onClick={() => setReplaceItem(item)}>{t("pages.orders.replace")}</Button>
                </span>
              </div>
            ))}
            <div>
              <p className="mb-2 font-semibold text-slate-950">{t("pages.orders.timeline")}</p>
              {selected.timeline.map((step) => (
                <p key={`${step.label}-${step.at}`} className="text-sm text-slate-600">{step.label} • {formatTime(step.at)}</p>
              ))}
            </div>
            <Button disabled={selected.status !== "PENDING"} variant="danger">{t("pages.orders.cancelPending")}</Button>
          </div>
        )}
      </Modal>
      <ReplaceMealModal
        open={Boolean(replaceItem)}
        item={replaceItem}
        menu={menu}
        loading={replaceMutation.isPending}
        onClose={() => setReplaceItem(null)}
        onSubmit={(newMenuItemId) => selected && replaceItem && replaceMutation.mutate({ orderId: selected.id, guestOrderItemId: replaceItem.guestOrderItemId ?? replaceItem.id, newMenuItemId })}
      />
    </PageWrapper>
  );
}
