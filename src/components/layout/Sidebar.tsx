import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BarChart3, Building2, ChefHat, ClipboardList, CreditCard, LayoutDashboard, Table2, Users, Utensils, CalendarDays } from "lucide-react";
import { cn } from "../../utils/cn";
import { useAuthStore } from "../../store/authStore";
import { canAccess } from "../../utils/roleCheck";
import type { Role } from "../../types";

const navItems: Array<{ to: string; labelKey: string; icon: typeof LayoutDashboard; roles: Role[] }> = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "BRANCH_MANAGER"] },
  { to: "/branches", labelKey: "nav.branches", icon: Building2, roles: ["SUPER_ADMIN"] },
  { to: "/customers", labelKey: "nav.customers", icon: Users, roles: ["SUPER_ADMIN", "BRANCH_MANAGER"] },
  { to: "/tables", labelKey: "nav.tables", icon: Table2, roles: ["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST", "SERVER", "CASHIER"] },
  { to: "/orders", labelKey: "nav.orders", icon: ClipboardList, roles: ["SUPER_ADMIN", "SERVER"] },
  { to: "/kitchen", labelKey: "nav.kitchen", icon: ChefHat, roles: ["SUPER_ADMIN", "SERVER"] },
  { to: "/menu", labelKey: "nav.menu", icon: Utensils, roles: ["SUPER_ADMIN", "BRANCH_MANAGER"] },
  { to: "/billing", labelKey: "nav.billing", icon: CreditCard, roles: ["SUPER_ADMIN", "CASHIER"] },
  { to: "/reservations", labelKey: "nav.reservations", icon: CalendarDays, roles: ["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST"] },
  { to: "/reports", labelKey: "nav.reports", icon: BarChart3, roles: ["SUPER_ADMIN", "BRANCH_MANAGER"] },
  { to: "/staff", labelKey: "nav.staff", icon: Users, roles: ["SUPER_ADMIN", "BRANCH_MANAGER"] }
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const role = useAuthStore((state) => state.role);
  const { t } = useTranslation();
  const visibleItems = navItems.filter((item) => canAccess(role, item.roles));

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-72 border-r border-slate-200 bg-forest-900 text-white transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <div>
            <p className="text-xl font-bold">BitePlate</p>
            <p className="text-xs text-emerald-100">{t("app.tagline")}</p>
          </div>
        </div>
        <nav className="space-y-1 p-4">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-emerald-50 transition hover:bg-white/10",
                    isActive && "bg-white text-forest-900 hover:bg-white"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {t(item.labelKey)}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      {open && <button className="fixed inset-0 z-20 bg-slate-950/40 lg:hidden" aria-label="Close menu" onClick={onClose} />}
    </>
  );
}
