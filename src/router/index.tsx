import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { Billing } from "../pages/Billing";
import { Branches } from "../pages/Branches";
import { Customers } from "../pages/Customers";
import { Dashboard } from "../pages/Dashboard";
import { Forbidden } from "../pages/Forbidden";
import { Kitchen } from "../pages/Kitchen";
import { Login } from "../pages/Login";
import { Menu } from "../pages/Menu";
import { NotFound } from "../pages/NotFound";
import { Orders } from "../pages/Orders";
import { Reports } from "../pages/Reports";
import { Reservations } from "../pages/Reservations";
import { Staff } from "../pages/Staff";
import { Tables } from "../pages/Tables";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/403", element: <Forbidden /> },
  {
    element: <ProtectedRoute allowed={["SUPER_ADMIN", "BRANCH_MANAGER"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/customers", element: <Customers /> },
          { path: "/reports", element: <Reports /> },
          { path: "/staff", element: <Staff /> }
        ]
      }
    ]
  },
  {
    element: <ProtectedRoute allowed={["SUPER_ADMIN"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [{ path: "/branches", element: <Branches /> }]
      }
    ]
  },
  {
    element: <ProtectedRoute allowed={["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST", "SERVER", "CASHIER"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [{ path: "/tables", element: <Tables /> }]
      }
    ]
  },
  {
    element: <ProtectedRoute allowed={["SUPER_ADMIN", "SERVER"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/orders", element: <Orders /> },
          { path: "/orders/new", element: <Orders initialMode="new" /> }
        ]
      }
    ]
  },
  {
    element: <ProtectedRoute allowed={["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [{ path: "/reservations", element: <Reservations /> }]
      }
    ]
  },
  {
    element: <ProtectedRoute allowed={["SUPER_ADMIN", "SERVER"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/kitchen", element: <Kitchen /> }
        ]
      }
    ]
  },
  {
    element: <ProtectedRoute allowed={["SUPER_ADMIN", "BRANCH_MANAGER"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [{ path: "/menu", element: <Menu /> }]
      }
    ]
  },
  {
    element: <ProtectedRoute allowed={["SUPER_ADMIN", "CASHIER"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [{ path: "/billing", element: <Billing /> }]
      }
    ]
  },
  { path: "*", element: <NotFound /> }
]);
