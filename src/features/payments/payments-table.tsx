import { DeleteButton } from "@/components/delete-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Payment } from "@/db/schema";
import { deletePayment } from "@/features/payments/actions";
import { paymentMethodLabels } from "@/features/payments/labels";
import { formatDate } from "@/lib/dates";
import { type CurrencyCode, formatMoney } from "@/lib/money";

export function PaymentsTable({
  payments,
  currency,
}: {
  payments: Payment[];
  currency?: CurrencyCode;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead className="w-0" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{formatDate(payment.paymentDate)}</TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatMoney(payment.amount, currency)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {payment.paymentMethod
                ? paymentMethodLabels[payment.paymentMethod]
                : "—"}
            </TableCell>
            <TableCell className="max-w-56 truncate text-muted-foreground">
              {payment.reference ?? payment.notes ?? "—"}
            </TableCell>
            <TableCell className="text-right">
              <DeleteButton
                action={deletePayment.bind(null, payment.id)}
                confirmText={`Delete this payment of ${formatMoney(payment.amount, currency)}?`}
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
