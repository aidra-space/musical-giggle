import type { PaymentMethod } from "@/db/enums";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  transfer: "Bank transfer",
  cash: "Cash",
  card: "Card",
  other: "Other",
};
