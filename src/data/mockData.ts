import type { Bill, MenuItem, Order, ReportMetric, Reservation, RestaurantTable, StaffUser } from "../types";

export const staffUsers: StaffUser[] = [
  { id: "u0", name: "Admin Super", email: "superadmin@biteplate.test", role: "SUPER_ADMIN", active: true },
  { id: "u1", name: "Madina Karimova", email: "manager@biteplate.test", role: "BRANCH_MANAGER", active: true },
  { id: "u2", name: "Aziz Toirov", email: "chef@biteplate.test", role: "SERVER", active: true },
  { id: "u3", name: "Sardor Akmalov", email: "waiter@biteplate.test", role: "RECEPTIONIST", active: true },
  { id: "u4", name: "Nilufar Raufova", email: "cashier@biteplate.test", role: "CASHIER", active: true }
];

export const tables: RestaurantTable[] = Array.from({ length: 20 }, (_, index) => {
  const statuses: RestaurantTable["status"][] = ["FREE", "RESERVED", "OCCUPIED", "AWAITING_BILL", "CLEARED"];
  return {
    id: `t${index + 1}`,
    number: index + 1,
    capacity: [2, 4, 6, 8][index % 4],
    status: statuses[index % statuses.length],
    server: index % 2 === 0 ? "Sardor Akmalov" : "Malika Botirova"
  };
});

export const menuItems: MenuItem[] = [
  {
    id: "m1",
    name: "Burrata Salad",
    description: "Fresh burrata, tomato, basil oil",
    price: 68000,
    category: "Starter",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=640&q=80",
    available: true,
    allergens: ["Dairy"]
  },
  {
    id: "m2",
    name: "Saffron Plov",
    description: "Uzbek rice, lamb, carrot, chickpeas",
    price: 82000,
    category: "Main",
    image: "https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&w=640&q=80",
    available: true,
    allergens: []
  },
  {
    id: "m3",
    name: "Ribeye Steak",
    description: "Charred ribeye, herbs, pepper sauce",
    price: 168000,
    category: "Main",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=640&q=80",
    available: true,
    allergens: ["Dairy"]
  },
  {
    id: "m4",
    name: "Pistachio Baklava",
    description: "Layered pastry, honey, pistachio",
    price: 42000,
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=640&q=80",
    available: true,
    allergens: ["Gluten", "Nuts"]
  },
  {
    id: "m5",
    name: "Mint Lemonade",
    description: "Lemon, mint, sparkling water",
    price: 26000,
    category: "Beverage",
    image: "https://images.unsplash.com/photo-1502741224143-90386d7f8c82?auto=format&fit=crop&w=640&q=80",
    available: false,
    allergens: []
  },
  {
    id: "m6",
    name: "Family Combo",
    description: "Two mains, two drinks, shared dessert",
    price: 245000,
    category: "Combo",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=640&q=80",
    available: true,
    allergens: ["Gluten", "Dairy"]
  }
];

const now = Date.now();
const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000).toISOString();
const minutesAhead = (minutes: number) => new Date(now + minutes * 60_000).toISOString();

export const orders: Order[] = [
  {
    id: "o101",
    tableId: "t3",
    tableNumber: 3,
    waiter: "Sardor Akmalov",
    status: "IN_PROGRESS",
    createdAt: minutesAgo(27),
    priority: 2,
    allergyAlert: "Nuts allergy",
    items: [
      { id: "oi1", menuItemId: "m3", name: "Ribeye Steak", quantity: 1, price: 168000, notes: "Medium rare" },
      { id: "oi2", menuItemId: "m4", name: "Pistachio Baklava", quantity: 2, price: 42000 }
    ],
    timeline: [
      { label: "Created", at: minutesAgo(27) },
      { label: "Kitchen accepted", at: minutesAgo(23) }
    ]
  },
  {
    id: "o102",
    tableId: "t8",
    tableNumber: 8,
    waiter: "Malika Botirova",
    status: "PENDING",
    createdAt: minutesAgo(9),
    priority: 1,
    items: [
      { id: "oi3", menuItemId: "m1", name: "Burrata Salad", quantity: 2, price: 68000 },
      { id: "oi4", menuItemId: "m5", name: "Mint Lemonade", quantity: 3, price: 26000 }
    ],
    timeline: [{ label: "Created", at: minutesAgo(9) }]
  },
  {
    id: "o103",
    tableId: "t14",
    tableNumber: 14,
    waiter: "Sardor Akmalov",
    status: "READY",
    createdAt: minutesAgo(41),
    priority: 3,
    items: [{ id: "oi5", menuItemId: "m2", name: "Saffron Plov", quantity: 4, price: 82000 }],
    timeline: [
      { label: "Created", at: minutesAgo(41) },
      { label: "Preparing", at: minutesAgo(36) },
      { label: "Ready", at: minutesAgo(4) }
    ]
  }
];

export const reservations: Reservation[] = [
  {
    id: "r1",
    customerName: "Dilshod Mirzaev",
    phone: "+998901112233",
    tableNumber: 2,
    partySize: 4,
    time: minutesAhead(55),
    status: "CONFIRMED",
    reminderSent: true
  },
  {
    id: "r2",
    customerName: "Lola Askarova",
    phone: "+998935556677",
    tableNumber: 9,
    partySize: 2,
    time: minutesAhead(160),
    status: "PENDING",
    reminderSent: false
  }
];

export const weeklyRevenue: ReportMetric[] = [
  { label: "Mon", value: 4_200_000 },
  { label: "Tue", value: 3_700_000 },
  { label: "Wed", value: 5_050_000 },
  { label: "Thu", value: 4_880_000 },
  { label: "Fri", value: 6_900_000 },
  { label: "Sat", value: 8_100_000 },
  { label: "Sun", value: 7_450_000 }
];

export const categorySales: ReportMetric[] = [
  { label: "Starter", value: 18 },
  { label: "Main", value: 42 },
  { label: "Dessert", value: 14 },
  { label: "Beverage", value: 26 }
];

export const busyHours: ReportMetric[] = [
  { label: "12:00", value: 18 },
  { label: "13:00", value: 27 },
  { label: "18:00", value: 31 },
  { label: "19:00", value: 42 },
  { label: "20:00", value: 38 }
];

export const billForTableEight: Bill = {
  tableNumber: 8,
  orderIds: ["o102"],
  items: orders[1].items,
  discountRate: 0.08,
  taxRate: 0.12,
  tip: 35000
};
