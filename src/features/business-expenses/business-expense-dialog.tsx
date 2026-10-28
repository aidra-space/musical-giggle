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
import { businessExpenseCategories } from "@/db/enums";
import { addBusinessExpense } from "@/features/business-expenses/actions";
import { businessExpenseCategoryLabels } from "@/features/business-expenses/labels";
import { fieldErrorsOf, idleActionState, valuesOf } from "@/lib/action-state";

export function BusinessExpenseDialog({ defaultDate }: { defaultDate: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add expense</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a business expense</DialogTitle>
          <DialogDescription>
            Costs of running the business that don&apos;t belong to one outfit —
            rent, power, marketing and the like.
          </DialogDescription>
        </DialogHeader>
        <BusinessExpenseForm
          defaultDate={defaultDate}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function BusinessExpenseForm({
  defaultDate,
  onSuccess,
}: {
  defaultDate: string;
  onSuccess: () => void;
}) {
  const [state, formAction] = useActionState(
    addBusinessExpense,
    idleActionState,
  );
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
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Category"
          htmlFor="category"
          errors={fieldErrors.category}
        >
          <NativeSelect
            id="category"
            name="category"
            defaultValue={values.category ?? "rent"}
          >
            {businessExpenseCategories.map((category) => (
              <NativeSelectOption key={category} value={category}>
                {businessExpenseCategoryLabels[category]}
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
          placeholder="Shop rent for October"
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
        <FormField label="Paid to" htmlFor="vendor" errors={fieldErrors.vendor}>
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
