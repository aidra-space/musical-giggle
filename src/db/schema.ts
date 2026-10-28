import { sql } from "drizzle-orm";
import {
  bigint,
  char,
  check,
  date,
  foreignKey,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { newId } from "../lib/id";
import {
  businessExpenseCategories,
  orderExpenseCategories,
  orderStatuses,
  paymentMethods,
} from "./enums";

export type {
  BusinessExpenseCategory,
  OrderExpenseCategory,
  OrderStatus,
  PaymentMethod,
} from "./enums";
export {
  businessExpenseCategories,
  orderExpenseCategories,
  orderStatuses,
  paymentMethods,
} from "./enums";

export const orderStatusEnum = pgEnum("order_status", orderStatuses);
export const paymentMethodEnum = pgEnum("payment_method", paymentMethods);
export const orderExpenseCategoryEnum = pgEnum(
  "order_expense_category",
  orderExpenseCategories,
);
export const businessExpenseCategoryEnum = pgEnum(
  "business_expense_category",
  businessExpenseCategories,
);

const id = () => text("id").primaryKey().$defaultFn(newId);

const createdAt = () =>
  timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow();

const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

const currency = () => char("currency", { length: 3 }).notNull().default("NGN");

const money = (name: string) => bigint(name, { mode: "number" }).notNull();

export const users = pgTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const customers = pgTable(
  "customers",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phoneNumber: text("phone_number"),
    email: text("email"),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    unique("customers_id_user_id_unique").on(t.id, t.userId),
    index("customers_user_id_idx").on(t.userId),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    customerId: text("customer_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    status: orderStatusEnum("status").notNull().default("new"),
    currency: currency(),
    amountCharged: money("amount_charged"),
    orderDate: date("order_date").notNull(),
    dueDate: date("due_date"),
    deliveredAt: timestamp("delivered_at", {
      withTimezone: true,
      mode: "date",
    }),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    foreignKey({
      name: "orders_customer_fk",
      columns: [t.customerId, t.userId],
      foreignColumns: [customers.id, customers.userId],
    }).onDelete("restrict"),
    unique("orders_id_user_id_unique").on(t.id, t.userId),
    index("orders_user_id_order_date_idx").on(t.userId, t.orderDate),
    index("orders_user_id_status_idx").on(t.userId, t.status),
    index("orders_customer_id_idx").on(t.customerId),
    check("orders_amount_charged_not_negative", sql`${t.amountCharged} >= 0`),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orderId: text("order_id").notNull(),
    amount: money("amount"),
    currency: currency(),
    paymentDate: date("payment_date").notNull(),
    paymentMethod: paymentMethodEnum("payment_method"),
    reference: text("reference"),
    notes: text("notes"),
    createdAt: createdAt(),
  },
  (t) => [
    foreignKey({
      name: "payments_order_fk",
      columns: [t.orderId, t.userId],
      foreignColumns: [orders.id, orders.userId],
    }).onDelete("cascade"),
    index("payments_order_id_idx").on(t.orderId),
    index("payments_user_id_payment_date_idx").on(t.userId, t.paymentDate),
    check("payments_amount_positive", sql`${t.amount} > 0`),
  ],
);

export const orderExpenses = pgTable(
  "order_expenses",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orderId: text("order_id").notNull(),
    category: orderExpenseCategoryEnum("category").notNull(),
    description: text("description").notNull(),
    amount: money("amount"),
    currency: currency(),
    expenseDate: date("expense_date").notNull(),
    vendor: text("vendor"),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    foreignKey({
      name: "order_expenses_order_fk",
      columns: [t.orderId, t.userId],
      foreignColumns: [orders.id, orders.userId],
    }).onDelete("cascade"),
    index("order_expenses_order_id_idx").on(t.orderId),
    check("order_expenses_amount_not_negative", sql`${t.amount} >= 0`),
  ],
);

export const businessExpenses = pgTable(
  "business_expenses",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: businessExpenseCategoryEnum("category").notNull(),
    description: text("description").notNull(),
    amount: money("amount"),
    currency: currency(),
    expenseDate: date("expense_date").notNull(),
    vendor: text("vendor"),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("business_expenses_user_id_expense_date_idx").on(
      t.userId,
      t.expenseDate,
    ),
    check("business_expenses_amount_not_negative", sql`${t.amount} >= 0`),
  ],
);

export type User = typeof users.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type OrderExpense = typeof orderExpenses.$inferSelect;
export type BusinessExpense = typeof businessExpenses.$inferSelect;
