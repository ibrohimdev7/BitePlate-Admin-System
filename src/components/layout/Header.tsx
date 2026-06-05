import { LogOut, Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getBranches } from "../../api/branches";
import { Button } from "../common/Button";
import { NotificationBell } from "./NotificationBell";
import { useAuthStore } from "../../store/authStore";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { i18n, t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const branchId = useAuthStore((state) => state.branchId);
  const setBranchId = useAuthStore((state) => state.setBranchId);
  const logout = useAuthStore((state) => state.logout);
  const branchesQuery = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
    enabled: role === "SUPER_ADMIN"
  });

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-sm text-slate-500">{t("app.admin")}</p>
          <p className="font-semibold text-slate-950">{user?.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {role === "SUPER_ADMIN" && (
          <select
            className="focus-ring h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
            value={branchId ?? ""}
            onChange={(event) => setBranchId(event.target.value || null)}
          >
            <option value="">{t("app.selectBranch")}</option>
            {(branchesQuery.data ?? []).map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        )}
        <select
          className="focus-ring h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
          value={i18n.language}
          onChange={(event) => {
            void i18n.changeLanguage(event.target.value);
            localStorage.setItem("biteplate-language", event.target.value);
          }}
        >
          <option value="uz">UZ</option>
          <option value="ru">RU</option>
        </select>
        <NotificationBell />
        <Button variant="secondary" icon={<LogOut className="h-4 w-4" />} onClick={logout}>
          {t("app.logout")}
        </Button>
      </div>
    </header>
  );
}
