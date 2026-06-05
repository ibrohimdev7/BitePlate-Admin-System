export type StaffRole =
  | 'SUPER_ADMIN'
  | 'BRANCH_MANAGER'
  | 'RECEPTIONIST'
  | 'SERVER'
  | 'CASHIER'

// Backwards-compatible alias
export type Role = StaffRole;

export type TableStatus = "FREE" | "RESERVED" | "OCCUPIED" | "AWAITING_BILL" | "CLEARED";
export type OrderStatus = "PENDING" | "IN_PROGRESS" | "READY" | "SERVED" | "CANCELLED";
export type MenuCategory = "Starter" | "Main" | "Dessert" | "Beverage" | "Combo";
export type PaymentMethod = "CASH" | "CARD" | "SPLIT";
export type ReservationStatus = "CONFIRMED" | "PENDING" | "CANCELLED";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  branchId?: string | null;
}

export interface RestaurantTable {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  server?: string;
  currentOrderId?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  sectionId?: string;
  sectionName?: string;
  image: string;
  available: boolean;
  allergens: string[];
}

export interface OrderItem {
  id: string;
  guestOrderItemId?: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  customizations?: string[];
  notes?: string;
}

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  waiter: string;
  status: OrderStatus;
  createdAt: string;
  priority: number;
  items: OrderItem[];
  allergyAlert?: string;
  timeline: Array<{ label: string; at: string }>;
}

export interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  notes?: string;
  tableNumber: number;
  tableId?: string;
  partySize: number;
  time: string;
  status: ReservationStatus;
  reminderSent: boolean;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  reservationsCount?: number;
  reservations?: Reservation[];
  orders?: Order[];
}

export interface MenuSection {
  id: string;
  name: string;
  displayOrder: number;
  itemsCount?: number;
}

export interface Bill {
  id?: string;
  tableNumber: number;
  orderIds: string[];
  items: OrderItem[];
  discountRate: number;
  taxRate: number;
  tip: number;
  total?: number;
  paymentMethod?: PaymentMethod;
}

export interface ReportMetric {
  label: string;
  value: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  tone: "info" | "success" | "warning" | "danger";
  createdAt: string;
}
