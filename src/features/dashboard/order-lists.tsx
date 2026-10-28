import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { OrderWithMoney } from "@/features/dashboard/queries";
import { OrderStatusBadge } from "@/features/orders/order-status-badge";
import { formatDate } from "@/lib/dates";
import { formatMoney, formatPercent, isCurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

function currencyOf(order: OrderWithMoney) {
  return isCurrencyCode(order.currency) ? order.currency : undefined;
}

function OrderRow({
  order,
  amount,
  amountClassName,
  detail,
}: {
  order: OrderWithMoney;
  amount: string;
  amountClassName?: string;
  detail: string;
}) {
  return (
    <li className="flex items-center justify-between gap-4 py-2.5">
      <div className="flex min-w-0 flex-col gap-0.5">
        <Link
          href={`/orders/${order.id}`}
          className="truncate text-sm font-medium hover:underline"
        >
          {order.title}
        </Link>
        <span className="truncate text-xs text-muted-foreground">
          {order.customerName} · {detail}
        </span>
      </div>
      <span className={cn("shrink-0 text-sm font-medium tabular-nums", amountClassName)}>
        {amount}
      </span>
    </li>
  );
}

function ListCard({
  title,
  description,
  emptyText,
  children,
  footerHref,
  footerLabel,
}: {
  title: string;
  description: string;
  emptyText: string;
  children: React.ReactNode[];
  footerHref?: string;
  footerLabel?: string;
}) {
  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {emptyText}
          </p>
        ) : (
          <ul className="divide-y">{children}</ul>
        )}
        {footerHref && footerLabel ? (
          <Link
            href={footerHref}
            className="mt-2 inline-block text-sm text-muted-foreground hover:underline"
          >
            {footerLabel}
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function RecentOrders({ orders }: { orders: OrderWithMoney[] }) {
  return (
    <ListCard
      title="Recent orders"
      description="The last outfits you added."
      emptyText="No orders yet."
      footerHref="/orders"
      footerLabel="All orders →"
    >
      {orders.map((order) => (
        <li key={order.id} className="flex items-center justify-between gap-4 py-2.5">
          <div className="flex min-w-0 flex-col gap-0.5">
            <Link
              href={`/orders/${order.id}`}
              className="truncate text-sm font-medium hover:underline"
            >
              {order.title}
            </Link>
            <span className="truncate text-xs text-muted-foreground">
              {order.customerName} · {formatDate(order.orderDate)}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <span className="text-sm font-medium tabular-nums">
              {formatMoney(order.amountCharged, currencyOf(order))}
            </span>
          </div>
        </li>
      ))}
    </ListCard>
  );
}

export function OwingOrders({ orders }: { orders: OrderWithMoney[] }) {
  return (
    <ListCard
      title="Customers still owe"
      description="Open orders with money left to collect, largest first."
      emptyText="Nobody owes you anything right now."
      footerHref="/customers"
      footerLabel="All customers →"
    >
      {orders.map((order) => (
        <OrderRow
          key={order.id}
          order={order}
          amount={formatMoney(order.money.outstanding, currencyOf(order))}
          amountClassName="text-negative"
          detail={`${formatMoney(order.money.amountReceived, currencyOf(order))} of ${formatMoney(order.money.amountCharged, currencyOf(order))} paid`}
        />
      ))}
    </ListCard>
  );
}

export function TopOrders({ orders }: { orders: OrderWithMoney[] }) {
  return (
    <ListCard
      title="Most profitable orders"
      description="Highest profit among orders dated in this period."
      emptyText="No orders in this period yet."
    >
      {orders.map((order) => (
        <OrderRow
          key={order.id}
          order={order}
          amount={formatMoney(order.money.grossProfit, currencyOf(order))}
          amountClassName={order.money.grossProfit < 0 ? "text-negative" : "text-positive"}
          detail={`${formatPercent(order.money.grossMarginPercent)} margin on ${formatMoney(order.money.revenue, currencyOf(order))}`}
        />
      ))}
    </ListCard>
  );
}
