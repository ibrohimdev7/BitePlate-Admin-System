import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { AlertToast } from "../notifications/AlertToast";
import { useSocket } from "../../hooks/useSocket";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useSocket();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 flex-1">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <Outlet />
      </div>
      <AlertToast />
    </div>
  );
}
