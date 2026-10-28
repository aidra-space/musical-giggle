import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/db/enums";
import { orderStatusLabels } from "@/features/orders/labels";
import { cn } from "@/lib/utils";

const statusClasses: Record<OrderStatus, string> = {
  new: "bg-secondary text-secondary-foreground",
  in_progress: "bg-chart-1/15 text-chart-1",
  ready: "bg-chart-2/20 text-chart-2",
  delivered: "bg-positive/15 text-positive",
  cancelled: "bg-muted text-muted-foreground line-through",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="outline" className={cn("border-transparent", statusClasses[status])}>
      {orderStatusLabels[status]}
    </Badge>
  );
}
