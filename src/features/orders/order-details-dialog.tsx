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
import { Textarea } from "@/components/ui/textarea";
import { updateOrderDetails } from "@/features/orders/actions";
import { fieldErrorsOf, idleActionState, valuesOf } from "@/lib/action-state";

export type OrderDetails = {
  id: string;
  title: string;
  description: string | null;
  amountCharged: string;
  orderDate: string;
  dueDate: string | null;
  notes: string | null;
};

export function OrderDetailsDialog({ order }: { order: OrderDetails }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit details</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit order</DialogTitle>
          <DialogDescription>
            Change the price, dates or notes. Payments and expenses stay as they
            are.
          </DialogDescription>
        </DialogHeader>
        <OrderDetailsForm order={order} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function OrderDetailsForm({
  order,
  onSuccess,
}: {
  order: OrderDetails;
  onSuccess: () => void;
}) {
  const [state, formAction] = useActionState(
    updateOrderDetails.bind(null, order.id),
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
      <FormField label="Outfit name" htmlFor="title" errors={fieldErrors.title}>
        <Input
          id="title"
          name="title"
          defaultValue={values.title ?? order.title}
          required
        />
      </FormField>
      <FormField
        label="Description"
        htmlFor="description"
        errors={fieldErrors.description}
      >
        <Textarea
          id="description"
          name="description"
          defaultValue={values.description ?? order.description ?? ""}
        />
      </FormField>
      <FormField
        label="Amount charged"
        htmlFor="amountCharged"
        errors={fieldErrors.amountCharged}
      >
        <MoneyInput
          id="amountCharged"
          name="amountCharged"
          defaultValue={values.amountCharged ?? order.amountCharged}
          required
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Order date"
          htmlFor="orderDate"
          errors={fieldErrors.orderDate}
        >
          <Input
            id="orderDate"
            name="orderDate"
            type="date"
            defaultValue={values.orderDate ?? order.orderDate}
            required
          />
        </FormField>
        <FormField label="Due date" htmlFor="dueDate" errors={fieldErrors.dueDate}>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={values.dueDate ?? order.dueDate ?? ""}
          />
        </FormField>
      </div>
      <FormField label="Notes" htmlFor="notes" errors={fieldErrors.notes}>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={values.notes ?? order.notes ?? ""}
        />
      </FormField>
      <div className="flex justify-end">
        <SubmitButton>Save changes</SubmitButton>
      </div>
    </form>
  );
}
