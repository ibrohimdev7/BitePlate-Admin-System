import { Activity, Banknote, Receipt, Table2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartPanel } from "../components/dashboard/ChartPanel";
import { StatsCard } from "../components/dashboard/StatsCard";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Spinner } from "../components/common/Spinner";
import { useOrders } from "../hooks/useOrders";
import { useTables } from "../hooks/useTables";
import { getReportData } from "../api/reports";
import { getUpcomingReservations } from "../api/reservations";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatTime } from "../utils/format";
import { OrderStatusBadge } from "../components/tables/StatusBadge";
import { useAuthStore } from "../store/authStore";

const chartColors = ["#1b4332", "#2d6a4f", "#f59e0b", "#2563eb", "#dc2626"];

export function Dashboard() {
  const branchId = useAuthStore((state) => state.branchId);
  const ordersQuery = useOrders();
  const tablesQuery = useTables();
  const reportsQuery = useQuery({ queryKey: ["reports", branchId], queryFn: () => getReportData(branchId!), enabled: Boolean(branchId) });
  const reservationsQuery = useQuery({ queryKey: ["reservations", "upcoming"], queryFn: getUpcomingReservations });

  if (!branchId) return <PageWrapper title="Dashboard" subtitle="Dashboard uchun filial tanlang."><div /></PageWrapper>;

  if (ordersQuery.isLoading || tablesQuery.isLoading || reportsQuery.isLoading || reservationsQuery.isLoading) return <Spinner />;

  const orders = ordersQuery.data ?? [];
  const tables = tablesQuery.data ?? [];
  const reportData = reportsQuery.data!;
  const reservations = reservationsQuery.data ?? [];
  const todayRevenue = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0), 0);
  const occupied = tables.filter((table) => ["OCCUPIED", "AWAITING_BILL"].includes(table.status)).length;
  const activeOrders = orders.filter((order) => !["SERVED", "CANCELLED"].includes(order.status)).length;
  const averageBill = todayRevenue / Math.max(orders.length, 1);

  return (
    <PageWrapper title="Dashboard" subtitle="Real-time restaurant health for managers.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Bugungi daromad" value={formatCurrency(todayRevenue)} helper="+12% vs yesterday" icon={<Banknote className="h-5 w-5" />} />
        <StatsCard label="Aktiv buyurtmalar" value={String(activeOrders)} helper="Kitchen and service queue" icon={<Receipt className="h-5 w-5" />} />
        <StatsCard label="Band stollar" value={`${occupied}/${tables.length}`} helper="Occupied or awaiting bill" icon={<Table2 className="h-5 w-5" />} />
        <StatsCard label="O'rtacha hisob" value={formatCurrency(averageBill)} helper="Across active checks" icon={<Activity className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <ChartPanel title="Haftalik daromad">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={reportData.weeklyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={(value) => `${Number(value) / 1_000_000}m`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line type="monotone" dataKey="value" stroke="#1b4332" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Toifalar bo'yicha sotuvlar">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={reportData.categorySales} dataKey="value" nameKey="label" innerRadius={60} outerRadius={100}>
                {reportData.categorySales.map((entry, index) => (
                  <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Eng ko'p buyurtma qilingan taomlar">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.topItems}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2d6a4f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Oxirgi orderlar va bronlar">
          <div className="space-y-4">
            {orders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                <div>
                  <p className="font-semibold text-slate-950">{order.id} • Table #{order.tableNumber}</p>
                  <p className="text-sm text-slate-500">{formatTime(order.createdAt)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            ))}
            {reservations.map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                <p className="font-semibold text-slate-950">{reservation.customerName}</p>
                <p className="text-sm text-slate-500">Table #{reservation.tableNumber} • {formatTime(reservation.time)}</p>
              </div>
            ))}
          </div>
        </ChartPanel>
      </div>
    </PageWrapper>
  );
}
