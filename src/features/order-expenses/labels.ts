import type { OrderExpenseCategory } from "@/db/enums";

export const orderExpenseCategoryLabels: Record<OrderExpenseCategory, string> =
  {
    fabric: "Fabric",
    lining: "Lining",
    accessories: "Accessories (zips, buttons, beads, stones)",
    labour: "Tailor / labour",
    embroidery: "Embroidery",
    delivery: "Delivery",
    packaging: "Packaging",
    transportation: "Transportation",
    other: "Other",
  };
