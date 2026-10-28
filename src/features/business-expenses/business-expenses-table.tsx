import { DeleteButton } from "@/components/delete-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BusinessExpense } from "@/db/schema";
import { deleteBusinessExpense } from "@/features/business-expenses/actions";
import { businessExpenseCategoryLabels } from "@/features/business-expenses/labels";
import { formatDate } from "@/lib/dates";
import { formatMoney, isCurrencyCode } from "@/lib/money";

export function BusinessExpensesTable({
  expenses,
}: {
  expenses: BusinessExpense[];
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
        {expenses.map((expense) => {
          const currency = isCurrencyCode(expense.currency)
            ? expense.currency
            : undefined;
          return (
            <TableRow key={expense.id}>
              <TableCell>{formatDate(expense.expenseDate)}</TableCell>
              <TableCell className="max-w-72">
                <div className="truncate font-medium">{expense.description}</div>
                {expense.vendor ? (
                  <div className="truncate text-xs text-muted-foreground">
                    {expense.vendor}
                  </div>
                ) : null}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {businessExpenseCategoryLabels[expense.category]}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatMoney(expense.amount, currency)}
              </TableCell>
              <TableCell className="text-right">
                <DeleteButton
                  action={deleteBusinessExpense.bind(null, expense.id)}
                  confirmText={`Delete "${expense.description}" (${formatMoney(expense.amount, currency)})?`}
                >
                  Remove
                </DeleteButton>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
