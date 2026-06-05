import type { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
}

export function StatsCard({ label, value, helper, icon }: StatsCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
          <p className="mt-1 text-sm text-slate-500">{helper}</p>
        </div>
        <div className="rounded-md bg-forest-50 p-3 text-forest-700">{icon}</div>
      </div>
    </article>
  );
}
