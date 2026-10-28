# Hemline

A small web app for a fashion designer to see what every outfit really makes, and whether the business as a whole is profitable.

Every order is treated like a small project with three separate money streams:

- **what was agreed** — the amount charged
- **what actually came in** — one or more payments
- **what it cost to make** — fabric, labour, delivery and other direct expenses

Running costs that don't belong to a single outfit (rent, power, marketing…) are tracked separately as business expenses. The dashboard brings the two together.

## Stack

Next.js (App Router, Server Components, Server Actions) · TypeScript · PostgreSQL · Drizzle ORM · Auth.js with email + password sign-in · Tailwind CSS · shadcn/ui · Zod · ULIDs for application IDs.

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a PostgreSQL database** and copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   Fill in `DATABASE_URL` and an `AUTH_SECRET` (`npx auth secret` generates one).

3. **Generate and run the first migration**

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

   `db:generate` reads `src/db/schema.ts` and writes SQL into `src/db/migrations/`; commit that folder. Re-run both commands whenever the schema changes.

4. **Run the app**

   ```bash
   npm run dev
   ```

   Create an account at `/sign-up` (name, email, password) and start at `/dashboard`. Sign-up is open to anyone who can reach the app; each account only ever sees its own data.

Other scripts: `npm run typecheck`, `npm run lint`, `npm test` (unit tests for money handling and the profit calculations), `npm run db:studio`.

## How the numbers work

Money is stored as integers in the smallest unit (kobo for NGN) in `bigint` columns, parsed from text input without ever touching floating point, and formatted as ₦200,000 (decimals only when there are kobo). Every money row carries a currency code; V1 is NGN-only with no conversion.

### Per order (`src/features/orders/financials.ts`)

| Figure | Rule |
|---|---|
| Received | sum of the order's payments |
| Customer still owes | `max(0, charged − received)` |
| Overpaid | `max(0, received − charged)` — shown explicitly instead of letting "owes" go negative |
| Cost to make | sum of the order's expenses |
| Gross profit | `charged − cost to make` |
| Margin | `gross profit ÷ charged`, shown as "—" when nothing was charged |

**Cancelled orders**: the order's value becomes whatever the customer actually paid (a kept deposit, for example), nothing is owed, and costs still count. A cancelled outfit with fabric already bought therefore shows as a loss rather than disappearing.

### Dashboard (`src/features/dashboard/queries.ts`)

The dashboard defaults to the current month and can show last month, this year, all time, or a custom range. Each figure follows one clearly defined date rule, and the cards say which:

| Figure | Date rule |
|---|---|
| Orders value, cost to make, gross profit, gross margin | **Order date.** An order's costs stay with the order even if the fabric was bought in a different month, so each order's profit is complete. |
| Cash received | **Payment date.** Money that actually came in during the period, whichever order it belongs to. |
| Running costs | **Expense date** of the business expense. |
| Net profit | gross profit − running costs |
| Customers still owe | A current balance across all open orders — not a period figure. |

Order-based revenue and cash flow are deliberately kept as separate cards and are never added together. The "last 6 months" chart uses the same rules per month.

## Project layout

```
src/
  app/                  routes only (sign-in, dashboard, orders, customers, expenses, auth API)
  auth.ts               Auth.js configuration and requireUserId()
  db/                   schema.ts, enums.ts, connection, migrations/
  lib/                  money, dates, ids, validation, periods, shared helpers
  features/
    customers/          queries, actions, Zod schema, components
    orders/             financials.ts (the domain calculations), queries, actions, components
    payments/
    order-expenses/
    business-expenses/
    dashboard/
  components/           app shell and small shared pieces; components/ui is shadcn/ui
```

Pages are Server Components that call query functions; every mutation is a Server Action validated with Zod. There are no repositories or service layers — each feature folder holds its own queries, actions and UI.

## Accounts and sign-in

Auth.js runs with the Credentials provider and JWT sessions. Passwords are hashed with Node's built-in scrypt (`src/lib/password.ts`, cost 2¹⁷, 16-byte salt, 64-byte key) and only the hash is stored. Sign-in checks the password in constant time even when the email is unknown. There is no password reset or email verification in V1.

## Data ownership

All business data belongs to a user. Every query filters by `user_id` and every update or delete matches `id AND user_id`, so a record that belongs to someone else simply reads as "not found". Payments and order expenses carry a composite foreign key `(order_id, user_id) → orders(id, user_id)`, and orders carry `(customer_id, user_id) → customers(id, user_id)`, so the database itself rejects a payment or order that points at another user's data. Amounts have check constraints (payments must be positive; charges and expenses cannot be negative).

## Not in V1

Inventory, suppliers, invoices, quotations, payment gateways, exchange rates, team accounts and reporting beyond the dashboard are intentionally left out. The model leaves room for a pricing assistant later (estimated costs per category → price at a target margin) by reusing the same expense categories and money helpers.
