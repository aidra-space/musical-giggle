import type { BusinessExpenseCategory } from "@/db/enums";

export const businessExpenseCategoryLabels: Record<
  BusinessExpenseCategory,
  string
> = {
  rent: "Rent",
  utilities: "Utilities (electricity, water)",
  internet: "Internet & phone",
  marketing: "Marketing",
  equipment: "Equipment",
  repairs: "Repairs",
  transportation: "Transportation",
  salaries: "Salaries",
  subscriptions: "Subscriptions",
  other: "Other",
};
