"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  FormField,
  FormMessage,
  MoneyInput,
  SubmitButton,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { createOrder } from "@/features/orders/actions";
import { fieldErrorsOf, idleActionState, valuesOf } from "@/lib/action-state";
import { cn } from "@/lib/utils";

type CustomerMode = "existing" | "new";

export function OrderForm({
  customers,
  defaultCustomerId,
  defaultOrderDate,
}: {
  customers: { id: string; name: string }[];
  defaultCustomerId?: string;
  defaultOrderDate: string;
}) {
  const [state, formAction] = useActionState(createOrder, idleActionState);
  const [customerMode, setCustomerMode] = useState<CustomerMode>(
    customers.length > 0 ? "existing" : "new",
  );
  const fieldErrors = fieldErrorsOf(state);
  const values = valuesOf(state);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <FormMessage state={state} />

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Customer</h2>
        <input type="hidden" name="customerMode" value={customerMode} />
        <div className="flex gap-2" role="radiogroup" aria-label="Customer">
          <ModeButton
            active={customerMode === "existing"}
            onClick={() => setCustomerMode("existing")}
            disabled={customers.length === 0}
          >
            Existing customer
          </ModeButton>
          <ModeButton
            active={customerMode === "new"}
            onClick={() => setCustomerMode("new")}
          >
            New customer
          </ModeButton>
        </div>

        {customerMode === "existing" ? (
          <FormField
            label="Customer"
            htmlFor="customerId"
            errors={fieldErrors.customerId}
          >
            <NativeSelect
              id="customerId"
              name="customerId"
              defaultValue={values.customerId ?? defaultCustomerId ?? ""}
              required
            >
              <NativeSelectOption value="" disabled>
                Choose a customer
              </NativeSelectOption>
              {customers.map((customer) => (
                <NativeSelectOption key={customer.id} value={customer.id}>
                  {customer.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FormField>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Customer name"
              htmlFor="customerName"
              errors={fieldErrors.customerName}
            >
              <Input
                id="customerName"
                name="customerName"
                defaultValue={values.customerName ?? ""}
                placeholder="Ada Okafor"
                required
              />
            </FormField>
            <FormField
              label="Phone number"
              htmlFor="customerPhoneNumber"
              errors={fieldErrors.customerPhoneNumber}
            >
              <Input
                id="customerPhoneNumber"
                name="customerPhoneNumber"
                type="tel"
                defaultValue={values.customerPhoneNumber ?? ""}
                placeholder="0803 123 4567"
              />
            </FormField>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Outfit</h2>
        <FormField label="Outfit name" htmlFor="title" errors={fieldErrors.title}>
          <Input
            id="title"
            name="title"
            defaultValue={values.title ?? ""}
            placeholder="Wedding dress"
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
            defaultValue={values.description ?? ""}
            placeholder="Style, fabric, fittings — anything that describes the job"
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            label="Amount charged"
            htmlFor="amountCharged"
            errors={fieldErrors.amountCharged}
            hint="The full price agreed with the customer"
          >
            <MoneyInput
              id="amountCharged"
              name="amountCharged"
              defaultValue={values.amountCharged ?? ""}
              placeholder="200000"
              required
            />
          </FormField>
          <FormField
            label="Order date"
            htmlFor="orderDate"
            errors={fieldErrors.orderDate}
          >
            <Input
              id="orderDate"
              name="orderDate"
              type="date"
              defaultValue={values.orderDate ?? defaultOrderDate}
              required
            />
          </FormField>
          <FormField
            label="Due date"
            htmlFor="dueDate"
            errors={fieldErrors.dueDate}
          >
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              defaultValue={values.dueDate ?? ""}
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
      </section>

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/orders">Cancel</Link>
        </Button>
        <SubmitButton pendingText="Adding…">Add order</SubmitButton>
      </div>
    </form>
  );
}

function ModeButton({
  active,
  children,
  ...props
}: React.ComponentProps<"button"> & { active: boolean }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      className={cn(
        "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-background hover:bg-accent",
      )}
      {...props}
    >
      {children}
    </button>
  );
}
