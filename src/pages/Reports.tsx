import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { downloadReport, getReportData } from "../api/reports";
import { Button } from "../components/common/Button";
import { Spinner } from "../components/common/Spinner";
import { ChartPanel } from "../components/dashboard/ChartPanel";
import { PageWrapper } from "../components/layout/PageWrapper";
import { useAuthStore } from "../store/authStore";
import { formatCurrency } from "../utils/format";

export function Reports() {
  const { t } = useTranslation();
  const branchId = useAuthStore((state) => state.branchId);
  const { data, isLoading } = useQuery({ queryKey: ["reports", branchId], queryFn: () => getReportData(branchId!), enabled: Boolean(branchId) });
  const saveBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };
  const csvFallback = () => {
    const rows = [
      ["section", "label", "value"],
      ...(data?.weeklyRevenue ?? []).map((item) => ["weeklyRevenue", item.label, item.value]),
      ...(data?.busyHours ?? []).map((item) => ["busyHours", item.label, item.value]),
      ...(data?.categorySales ?? []).map((item) => ["categorySales", item.label, item.value]),
      ...(data?.topItems ?? []).map((item) => ["topItems", item.label, item.value]),
    ];
    return new Blob([rows.map((row) => row.map(String).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  };
  const exportMutation = useMutation({
    mutationFn: async (format: "csv" | "pdf") => {
      try {
        return await downloadReport(branchId!, format);
      } catch (error) {
        if (format === "csv") return csvFallback();
        throw error;
      }
    },
    onSuccess: (blob, format) => saveBlob(blob, `biteplate-report.${format}`),
  });
  if (!branchId) return <PageWrapper title={t("pages.reports.title")} subtitle="Hisobotlar uchun filial tanlang."><div /></PageWrapper>;
  if (isLoading) return <Spinner />;

  return (
    <PageWrapper
      title={t("pages.reports.title")}
      subtitle={t("pages.reports.subtitle")}
      action={<div className="flex gap-2"><Button variant="secondary" icon={<Download className="h-4 w-4" />} disabled={exportMutation.isPending} onClick={() => exportMutation.mutate("csv")}>CSV</Button><Button icon={<Download className="h-4 w-4" />} disabled={exportMutation.isPending} onClick={() => exportMutation.mutate("pdf")}>PDF</Button></div>}
    >
      <section className="mb-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm">
            <span className="font-semibold text-slate-700">From</span>
            <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" type="date" />
          </label>
          <label className="text-sm">
            <span className="font-semibold text-slate-700">To</span>
            <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" type="date" />
          </label>
          <label className="text-sm">
            <span className="font-semibold text-slate-700">Report type</span>
            <select className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2">
              <option>Daily revenue</option>
              <option>Top 10 dishes</option>
              <option>Staff covers</option>
              <option>Waste</option>
              <option>Busy hours</option>
            </select>
          </label>
        </div>
      </section>
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartPanel title="Kunlik/haftalik daromad">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.weeklyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={(value) => `${Number(value) / 1_000_000}m`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="value" fill="#1b4332" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Eng band soatlar">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.busyHours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
    </PageWrapper>
  );
}
