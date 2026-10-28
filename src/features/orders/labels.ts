import type { OrderStatus } from "@/db/enums";

export const orderStatusLabels: Record<OrderStatus, string> = {
  new: "New",
  in_progress: "In progress",
  ready: "Ready",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
