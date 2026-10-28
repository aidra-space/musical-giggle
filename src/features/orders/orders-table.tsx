import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orderFinancials } from "@/features/orders/financials";
import { OrderStatusBadge } from "@/features/orders/order-status-badge";
import type { OrderWithTotals } from "@/features/orders/queries";
import { formatDate } from "@/lib/dates";
import { formatMoney, isCurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

export function OrdersTable({
  orders,
  showCustomer = true,
}: {
  orders: OrderWithTotals[];
  showCustomer?: boolean;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Outfit</TableHead>
          {showCustomer ? <TableHead>Customer</TableHead> : null}
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Charged</TableHead>
          <TableHead className="text-right">Received</TableHead>
          <TableHead className="text-right">Still owes</TableHead>
          <TableHead className="text-right">Cost to make</TableHead>
          <TableHead className="text-right">Profit</TableHead>
          <TableHead>Due</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const currency = isCurrencyCode(order.currency)
            ? order.currency
            : undefined;
          const money = orderFinancials(order);
          return (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                <Link href={`/orders/${order.id}`} className="hover:underline">
                  {order.title}
                </Link>
                <div className="text-xs text-muted-foreground">
                  {formatDate(order.orderDate)}
                </div>
              </TableCell>
              {showCustomer ? (
                <TableCell>
                  <Link
                    href={`/customers/${order.customerId}`}
                    className="hover:underline"
                  >
                    {order.customerName}
                  </Link>
                </TableCell>
              ) : null}
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatMoney(money.amountCharged, currency)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatMoney(money.amountReceived, currency)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right tabular-nums",
                  money.outstanding > 0 && "font-medium text-negative",
                )}
              >
                {money.overpaid > 0
                  ? `Overpaid ${formatMoney(money.overpaid, currency)}`
                  : formatMoney(money.outstanding, currency)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatMoney(money.directCost, currency)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right tabular-nums font-medium",
                  money.grossProfit < 0 && "text-negative",
                )}
              >
                {formatMoney(money.grossProfit, currency)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {order.dueDate ? formatDate(order.dueDate) : "—"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
