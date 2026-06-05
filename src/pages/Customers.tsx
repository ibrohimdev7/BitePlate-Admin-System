import { useState } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "../api/customers";
import { Modal } from "../components/common/Modal";
import { Spinner } from "../components/common/Spinner";
import { PageWrapper } from "../components/layout/PageWrapper";
import type { Customer } from "../types";
import { formatDate, formatCurrency } from "../utils/format";

export function Customers() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ["customers", query], queryFn: () => getCustomers({ search: query }) });
  const customers = data ?? [];

  if (isLoading) return <Spinner />;

  return (
    <PageWrapper title="Mijozlar" subtitle="Website orqali ro'yxatdan o'tgan mijozlar ro'yxati.">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
          <h2 className="font-bold text-slate-950">Mijozlar</h2>
          <div className="relative w-72 max-w-full">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input className="focus-ring w-full rounded-md border border-slate-200 py-2 pl-9 pr-3 text-sm" placeholder="Qidirish" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-[1.2fr_1fr_1.2fr_120px] gap-4 border-b border-slate-200 p-4 text-sm font-semibold text-slate-600">
          <span>Ismi</span>
          <span>Telefon</span>
          <span>Email</span>
          <span>Bronlar</span>
        </div>
        {customers.map((customer) => (
          <button key={customer.id} className="grid w-full grid-cols-[1.2fr_1fr_1.2fr_120px] gap-4 border-b border-slate-100 p-4 text-left text-sm transition hover:bg-slate-50 last:border-b-0" onClick={() => setSelected(customer)}>
            <span className="font-semibold text-slate-950">{customer.name}</span>
            <span className="text-slate-600">{customer.phone}</span>
            <span className="truncate text-slate-600">{customer.email ?? "-"}</span>
            <span className="text-slate-600">{customer.reservationsCount ?? 0} ta</span>
          </button>
        ))}
      </section>
      <Modal title={selected?.name ?? "Mijoz"} open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-5">
            <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-700">
              <p><span className="font-semibold">Telefon:</span> {selected.phone}</p>
              <p><span className="font-semibold">Email:</span> {selected.email ?? "-"}</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-slate-950">Bronlar</h3>
              {(selected.reservations ?? []).length === 0 ? <p className="text-sm text-slate-500">Bronlar yo'q.</p> : selected.reservations?.map((reservation) => (
                <p key={reservation.id} className="border-b border-slate-100 py-2 text-sm text-slate-600">{formatDate(reservation.time)} - Table #{reservation.tableNumber}</p>
              ))}
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-slate-950">Buyurtmalar</h3>
              {(selected.orders ?? []).length === 0 ? <p className="text-sm text-slate-500">Buyurtmalar yo'q.</p> : selected.orders?.map((order) => (
                <p key={order.id} className="border-b border-slate-100 py-2 text-sm text-slate-600">Order {order.id} - {formatCurrency(order.items.reduce((sum, item) => sum + item.price * item.quantity, 0))}</p>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}
