import type {
  Bill,
  Branch,
  Customer,
  MenuCategory,
  MenuItem,
  MenuSection,
  Order,
  OrderItem,
  Reservation,
  RestaurantTable,
  StaffUser,
} from "../types";

export interface ApiList<T> {
  data: T[];
  total?: number;
  page?: number;
}

export function unwrapList<T>(
  payload:
    | T[]
    | ApiList<T>
    | { items: T[] }
    | { queue: T[] }
    | { staff: T[] }
    | { commands: T[] },
): T[] {
  if (Array.isArray(payload)) return payload;
  if ("data" in payload && Array.isArray(payload.data)) return payload.data;
  if ("items" in payload && Array.isArray(payload.items)) return payload.items;
  if ("queue" in payload && Array.isArray(payload.queue)) return payload.queue;
  if ("staff" in payload && Array.isArray(payload.staff)) return payload.staff;
  if ("commands" in payload && Array.isArray(payload.commands))
    return payload.commands;
  return [];
}

export function normalizeStaffUser(user: any): StaffUser {
  return {
    id: String(user.id),
    name: user.name ?? user.fullName ?? "Unknown",
    email: user.email ?? "",
    role: user.role,
    active: user.active ?? user.isActive ?? true,
    branchId: user.branchId ?? user.branch?.id ?? null,
  };
}

export function normalizeTable(table: any): RestaurantTable {
  return {
    id: String(table.id),
    number: Number(table.number ?? table.tableNumber ?? 0),
    capacity: Number(table.capacity ?? 0),
    status: table.status,
    server: table.server ?? table.staff?.name,
    currentOrderId: table.currentOrderId,
  };
}

const categoryFromApi: Record<string, MenuCategory> = {
  STARTER: "Starter",
  MAIN: "Main",
  DESSERT: "Dessert",
  BEVERAGE: "Beverage",
  COMBO: "Combo",
};

export function categoryToApi(category: MenuCategory): string {
  return category.toUpperCase();
}

export function normalizeMenuItem(item: any): MenuItem {
  return {
    id: String(item.id),
    name: item.name ?? "Untitled item",
    description: item.description ?? "",
    price: Number(item.price ?? item.basePrice ?? 0),
    category:
      categoryFromApi[item.type ?? item.category] ?? item.category ?? "Main",
    sectionId: item.sectionId ?? item.section?.id,
    sectionName: item.sectionName ?? item.section?.name,
    image:
      item.image ??
      item.imageUrl ??
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=640&q=80",
    available: item.available ?? item.isAvailable ?? true,
    allergens: item.allergens ?? [],
  };
}

export function normalizeOrderItem(item: any): OrderItem {
  const menuItem = item.menuItem ?? {};
  return {
    id: String(item.id ?? item.menuItemId ?? menuItem.id),
    guestOrderItemId: item.guestOrderItemId ?? item.id,
    menuItemId: String(item.menuItemId ?? menuItem.id ?? item.id),
    name: item.name ?? menuItem.name ?? "Item",
    quantity: Number(item.quantity ?? 1),
    price: Number(
      item.price ?? item.basePrice ?? menuItem.price ?? menuItem.basePrice ?? 0,
    ),
    customizations: item.customizations,
    notes: item.notes,
  };
}

export function normalizeOrder(order: any): Order {
  const table = order.table ?? {};
  const staff = order.staff ?? order.waiter ?? {};
  const createdAt = order.createdAt ?? new Date().toISOString();

  return {
    id: String(order.id ?? order.orderId),
    tableId: String(order.tableId ?? table.id ?? ""),
    tableNumber: Number(order.tableNumber ?? table.number ?? 0),
    waiter:
      typeof staff === "string"
        ? staff
        : (staff.name ?? order.waiterName ?? ""),
    status: order.status,
    createdAt,
    priority: Number(order.priority ?? 1),
    allergyAlert: order.allergyAlert ?? order.allergens?.join(", "),
    items: unwrapList<any>(order.items ?? []).map(normalizeOrderItem),
    timeline: order.timeline ?? [{ label: "Created", at: createdAt }],
  };
}

export function normalizeReservation(reservation: any): Reservation {
  const table = reservation.table ?? {};
  return {
    id: String(reservation.id),
    customerName:
      reservation.guestName ??
      reservation.customerName ??
      reservation.name ??
      "",
    phone:
      reservation.guestPhone ??
      reservation.phone ??
      reservation.customerPhone ??
      "",
    notes: reservation.notes ?? "",
    tableNumber: Number(reservation.tableNumber ?? table.number ?? 0),
    tableId: reservation.tableId ?? table.id,
    partySize: Number(reservation.partySize ?? 1),
    time:
      reservation.time ?? reservation.scheduledAt ?? new Date().toISOString(),
    status: reservation.status,
    reminderSent: reservation.reminderSent ?? false,
  };
}

export function normalizeBranch(branch: any): Branch {
  return {
    id: String(branch.id),
    name: branch.name ?? "Unnamed branch",
    address: branch.address ?? "",
    phone: branch.phone ?? "",
    active: branch.active ?? branch.isActive ?? true,
  };
}

export function normalizeCustomer(customer: any): Customer {
  return {
    id: String(customer.id),
    name: customer.name ?? customer.fullName ?? "Unknown",
    phone: customer.phone ?? customer.customerPhone ?? "",
    email: customer.email,
    reservationsCount:
      customer.reservationsCount ??
      customer.reservationCount ??
      customer.reservations?.length ??
      0,
    reservations: Array.isArray(customer.reservations)
      ? customer.reservations.map(normalizeReservation)
      : [],
    orders: Array.isArray(customer.orders)
      ? customer.orders.map(normalizeOrder)
      : [],
  };
}

export function normalizeMenuSection(section: any): MenuSection {
  return {
    id: String(section.id),
    name: section.name ?? "Bo'lim",
    displayOrder: Number(section.displayOrder ?? section.sortOrder ?? 0),
    itemsCount: section.itemsCount ?? section.items?.length,
  };
}

export function normalizeBill(payload: any, tableNumber?: number): Bill | null {
  const bill = payload?.bill ?? payload;
  if (!bill) return null;

  return {
    id: bill.id,
    tableNumber: Number(
      bill.tableNumber ?? bill.table?.number ?? tableNumber ?? 0,
    ),
    orderIds: bill.orderIds ?? (bill.orderId ? [bill.orderId] : []),
    items: unwrapList<any>(bill.items ?? bill.lineItems ?? []).map(
      normalizeOrderItem,
    ),
    discountRate: Number(bill.discountRate ?? 0),
    taxRate: Number(
      bill.taxRate ??
        (bill.taxAmount && bill.subtotal ? bill.taxAmount / bill.subtotal : 0),
    ),
    tip: Number(bill.tip ?? bill.tipAmount ?? 0),
    total: bill.total,
    paymentMethod: bill.paymentMethod,
  };
}
