import { apiClient } from "./client";
import type { ReportMetric } from "../types";

export interface ReportData {
  daily: any;
  weeklyRevenue: ReportMetric[];
  categorySales: ReportMetric[];
  busyHours: ReportMetric[];
  topItems: ReportMetric[];
}

const toMetric = (item: any, labelKeys: string[], valueKeys: string[]) => ({
  label: labelKeys.map((key) => item[key]).find(Boolean) ?? "",
  value: Number(valueKeys.map((key) => item[key]).find((value) => value !== undefined) ?? 0)
});

export async function getReportData(branchId: string, params: { date?: string; from?: string; to?: string; days?: number } = {}): Promise<ReportData> {
  const today = params.date ?? new Date().toISOString().slice(0, 10);
  const defaultFrom = new Date(Date.now() - 6 * 24 * 60 * 60_000).toISOString().slice(0, 10);
  const days = params.days ?? 7;
  const [{ data: daily }, { data: weekly }, { data: topItems }, { data: peakHours }] = await Promise.all([
    apiClient.get(`/branches/${branchId}/reports/daily`, { params: { date: today, breakdown: "category" } }),
    apiClient.get(`/branches/${branchId}/reports/daily`, { params: { from: params.from ?? defaultFrom, to: params.to ?? today } }),
    apiClient.get("/history/top-items", { params: { limit: 10, days: 30 } }),
    apiClient.get("/reports/peak-hours", { params: { days } })
  ]);

  return {
    daily,
    weeklyRevenue: (weekly.days ?? []).map((item: any) => toMetric(item, ["date", "label"], ["revenue", "value", "amount"])),
    categorySales: (daily.categories ?? []).map((item: any) => toMetric(item, ["name", "category", "label"], ["amount", "value", "revenue"])),
    busyHours: (peakHours.hours ?? []).map((item: any) => toMetric(item, ["hour", "label"], ["orderCount", "count", "value"])),
    topItems: (topItems.items ?? []).map((item: any) => toMetric(item, ["name", "label"], ["count", "value", "revenue"]))
  };
}

export async function getStaffReport(params: { from?: string; to?: string } = {}) {
  const { data } = await apiClient.get("/reports/staff", { params });
  return data.staff ?? [];
}

export async function getWasteReport(params: { from?: string; to?: string } = {}) {
  const { data } = await apiClient.get("/reports/waste", { params });
  return data.cancelled ?? [];
}

export async function getHistory(params: { from?: string; to?: string; tableId?: string; staffId?: string } = {}) {
  const { data } = await apiClient.get("/history", { params });
  return data;
}

export async function downloadReport(branchId: string, format: "csv" | "pdf", params: { from?: string; to?: string; type?: string } = {}) {
  const { data } = await apiClient.get(`/branches/${branchId}/reports/export`, {
    params: { ...params, format },
    responseType: "blob"
  });
  return data as Blob;
}
