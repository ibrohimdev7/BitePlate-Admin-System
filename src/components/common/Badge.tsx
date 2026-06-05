import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface BadgeProps {
  tone?: "green" | "blue" | "red" | "yellow" | "slate" | "purple";
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = "slate", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "green" && "bg-emerald-100 text-emerald-800",
        tone === "blue" && "bg-sky-100 text-sky-800",
        tone === "red" && "bg-red-100 text-red-800",
        tone === "yellow" && "bg-amber-100 text-amber-900",
        tone === "slate" && "bg-slate-100 text-slate-700",
        tone === "purple" && "bg-violet-100 text-violet-800",
        className
      )}
    >
      {children}
    </span>
  );
}
