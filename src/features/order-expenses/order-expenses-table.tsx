import { DeleteButton } from "@/components/delete-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrderExpense } from "@/db/schema";
import { deleteOrderExpense } from "@/features/order-expenses/actions";
import { orderExpenseCategoryLabels } from "@/features/order-expenses/labels";
import { formatDate } from "@/lib/dates";
import { type CurrencyCode, formatMoney } from "@/lib/money";

export function OrderExpensesTable({
  expenses,
  currency,
}: {
  expenses: OrderExpense[];
  currency?: CurrencyCode;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Expense</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-0" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell>{formatDate(expense.expenseDate)}</TableCell>
            <TableCell className="max-w-64">
              <div className="truncate font-medium">{expense.description}</div>
              {expense.vendor ? (
                <div className="truncate text-xs text-muted-foreground">
                  {expense.vendor}
                </div>
              ) : null}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {orderExpenseCategoryLabels[expense.category]}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatMoney(expense.amount, currency)}
            </TableCell>
            <TableCell className="text-right">
              <DeleteButton
                action={deleteOrderExpense.bind(null, expense.id)}
                confirmText={`Delete "${expense.description}" (${formatMoney(expense.amount, currency)})?`}
              >
                Remove
              </DeleteButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
