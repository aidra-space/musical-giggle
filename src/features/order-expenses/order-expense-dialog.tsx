"use client";

import { useActionState, useEffect, useState } from "react";

import {
  FormField,
  FormMessage,
  MoneyInput,
  SubmitButton,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { orderExpenseCategories } from "@/db/enums";
import { addOrderExpense } from "@/features/order-expenses/actions";
import { orderExpenseCategoryLabels } from "@/features/order-expenses/labels";
import { fieldErrorsOf, idleActionState, valuesOf } from "@/lib/action-state";

export function OrderExpenseDialog({
  orderId,
  defaultDate,
}: {
  orderId: string;
  defaultDate: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add expense</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add an expense</DialogTitle>
          <DialogDescription>
            Something you spent making this outfit — fabric, tailoring, delivery
            and so on.
          </DialogDescription>
        </DialogHeader>
        <OrderExpenseForm
          orderId={orderId}
          defaultDate={defaultDate}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function OrderExpenseForm({
  orderId,
  defaultDate,
  onSuccess,
}: {
  orderId: string;
  defaultDate: string;
  onSuccess: () => void;
}) {
  const [state, formAction] = useActionState(addOrderExpense, idleActionState);
  const fieldErrors = fieldErrorsOf(state);
  const values = valuesOf(state);

  useEffect(() => {
    if (state.status === "success") {
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage state={state} />
      <input type="hidden" name="orderId" value={orderId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Category"
          htmlFor="category"
          errors={fieldErrors.category}
        >
          <NativeSelect
            id="category"
            name="category"
            defaultValue={values.category ?? "fabric"}
          >
            {orderExpenseCategories.map((category) => (
              <NativeSelectOption key={category} value={category}>
                {orderExpenseCategoryLabels[category]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FormField>
        <FormField label="Amount" htmlFor="amount" errors={fieldErrors.amount}>
          <MoneyInput
            id="amount"
            name="amount"
            defaultValue={values.amount ?? ""}
            autoFocus
            required
          />
        </FormField>
      </div>
      <FormField
        label="What was it?"
        htmlFor="description"
        errors={fieldErrors.description}
      >
        <Input
          id="description"
          name="description"
          defaultValue={values.description ?? ""}
          placeholder="5 yards of lace"
          required
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Date"
          htmlFor="expenseDate"
          errors={fieldErrors.expenseDate}
        >
          <Input
            id="expenseDate"
            name="expenseDate"
            type="date"
            defaultValue={values.expenseDate ?? defaultDate}
            required
          />
        </FormField>
        <FormField
          label="Bought from"
          htmlFor="vendor"
          errors={fieldErrors.vendor}
        >
          <Input
            id="vendor"
            name="vendor"
            defaultValue={values.vendor ?? ""}
            placeholder="Optional"
          />
        </FormField>
      </div>
      <FormField label="Notes" htmlFor="notes" errors={fieldErrors.notes}>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={values.notes ?? ""}
          placeholder="Optional"
        />
      </FormField>
      <div className="flex justify-end">
        <SubmitButton>Add expense</SubmitButton>
      </div>
    </form>
  );
}
