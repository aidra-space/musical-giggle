import type { Metadata } from "next";
import Link from "next/link";

import { requireUserId } from "@/auth";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerDialog } from "@/features/customers/customer-dialog";
import { listCustomersWithTotals } from "@/features/customers/queries";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function CustomersPage() {
  const userId = await requireUserId();
  const customers = await listCustomersWithTotals(userId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description="Who you have worked with and who still owes you."
      >
        <CustomerDialog trigger={<Button>Add customer</Button>} />
      </PageHeader>

      {customers.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="Customers are added automatically when you create an order, or add one here."
        >
          <div className="flex gap-2">
            <CustomerDialog
              trigger={<Button variant="outline">Add customer</Button>}
            />
            <Button asChild>
              <Link href="/orders/new">Add order</Link>
            </Button>
          </div>
        </EmptyState>
      ) : (
        <Card className="gap-0 px-2 py-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Total value</TableHead>
                <TableHead className="text-right">Received</TableHead>
                <TableHead className="text-right">Still owes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="hover:underline"
                    >
                      {customer.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.phoneNumber ?? "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {customer.orderCount}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(customer.totalValue)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(customer.amountReceived)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums",
                      customer.outstanding > 0 && "font-medium text-negative",
                    )}
                  >
                    {formatMoney(customer.outstanding)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
