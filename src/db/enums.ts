export const orderStatuses = [
  "new",
  "in_progress",
  "ready",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const paymentMethods = ["transfer", "cash", "card", "other"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export const orderExpenseCategories = [
  "fabric",
  "lining",
  "accessories",
  "labour",
  "embroidery",
  "delivery",
  "packaging",
  "transportation",
  "other",
] as const;
export type OrderExpenseCategory = (typeof orderExpenseCategories)[number];

export const businessExpenseCategories = [
  "rent",
  "utilities",
  "internet",
  "marketing",
  "equipment",
  "repairs",
  "transportation",
  "salaries",
  "subscriptions",
  "other",
] as const;
export type BusinessExpenseCategory =
  (typeof businessExpenseCategories)[number];
