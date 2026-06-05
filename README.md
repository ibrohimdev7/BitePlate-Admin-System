# BitePlate Admin System

React + TypeScript admin interface for BitePlate Smart Restaurant Management System.

## Stack

- React 18, Vite, TypeScript
- TailwindCSS
- React Router v6 protected routes
- TanStack React Query for server state
- Zustand for auth and socket state
- React Hook Form + Zod validation
- Recharts dashboards
- Axios and Socket.IO Client integration points

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build

```bash
npm run build
```

## Environment

Set the backend and Socket.IO URL before running the app.

```bash
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

## API Integration

The admin panel now calls the backend endpoints from the integration map:

- Auth: `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`
- Dashboard and reports: `/reports/daily`, `/reports/peak-hours`, `/history/top-items`
- Tables, orders, kitchen, menu, billing, reservations, and staff modules use their matching REST endpoints
- Socket.IO listens for `order:status_changed`, `kitchen:order_ready`, `table:status_changed`, `reservation:reminder`, and `allergy:alert`

## Login Users

| Role | Email | Password |
| --- | --- | --- |
| Manager | manager@biteplate.test | password123 |
| Head Chef | chef@biteplate.test | password123 |
| Waiter | waiter@biteplate.test | password123 |
| Cashier | cashier@biteplate.test | password123 |

## Implemented Screens

- Login with role-based redirect
- Manager dashboard with revenue, sales, top items, reservations, and recent orders
- Tables grid with status filtering and detail modal
- Orders workspace with menu search, totals, status filters, and order detail
- Kitchen command queue with prepare, ready, expedite, cancel, undo, and allergy alerts
- Menu management with category tabs, item form, availability toggles, and combo builder placeholder
- Billing with bill lookup, tax/tip/discount totals, split bill, and print preview action
- Reservations calendar-style list with conflict-aware form
- Reports with date filters, charts, CSV/PDF actions
- Staff management with add, edit role, and deactivate flows
# BitePlate-Admin-System
