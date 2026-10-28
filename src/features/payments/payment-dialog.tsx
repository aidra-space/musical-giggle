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
import { paymentMethods } from "@/db/enums";
import { recordPayment } from "@/features/payments/actions";
import { paymentMethodLabels } from "@/features/payments/labels";
import { fieldErrorsOf, idleActionState, valuesOf } from "@/lib/action-state";

export function PaymentDialog({
  orderId,
  outstanding,
  defaultDate,
}: {
  orderId: string;
  outstanding: string | null;
  defaultDate: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Record payment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record a payment</DialogTitle>
          <DialogDescription>
            Money the customer has actually paid for this outfit.
          </DialogDescription>
        </DialogHeader>
        <PaymentForm
          orderId={orderId}
          outstanding={outstanding}
          defaultDate={defaultDate}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function PaymentForm({
  orderId,
  outstanding,
  defaultDate,
  onSuccess,
}: {
  orderId: string;
  outstanding: string | null;
  defaultDate: string;
  onSuccess: () => void;
}) {
  const [state, formAction] = useActionState(recordPayment, idleActionState);
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
          label="Amount"
          htmlFor="amount"
          errors={fieldErrors.amount}
          hint={outstanding ? `Still owed: ${outstanding}` : undefined}
        >
          <MoneyInput
            id="amount"
            name="amount"
            defaultValue={values.amount ?? ""}
            autoFocus
            required
          />
        </FormField>
        <FormField
          label="Date"
          htmlFor="paymentDate"
          errors={fieldErrors.paymentDate}
        >
          <Input
            id="paymentDate"
            name="paymentDate"
            type="date"
            defaultValue={values.paymentDate ?? defaultDate}
            required
          />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="How was it paid?"
          htmlFor="paymentMethod"
          errors={fieldErrors.paymentMethod}
        >
          <NativeSelect
            id="paymentMethod"
            name="paymentMethod"
            defaultValue={values.paymentMethod ?? ""}
          >
            <NativeSelectOption value="">Not specified</NativeSelectOption>
            {paymentMethods.map((method) => (
              <NativeSelectOption key={method} value={method}>
                {paymentMethodLabels[method]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FormField>
        <FormField
          label="Reference"
          htmlFor="reference"
          errors={fieldErrors.reference}
        >
          <Input
            id="reference"
            name="reference"
            defaultValue={values.reference ?? ""}
            placeholder="Transfer reference, receipt number…"
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
        <SubmitButton>Record payment</SubmitButton>
      </div>
    </form>
  );
}
