"use client";

import { useActionState, useEffect } from "react";

import { FormField, FormMessage, SubmitButton } from "@/components/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Customer } from "@/db/schema";
import {
  type ActionState,
  fieldErrorsOf,
  idleActionState,
  valuesOf,
} from "@/lib/action-state";

export function CustomerForm({
  action,
  customer,
  onSuccess,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  customer?: Customer;
  onSuccess?: () => void;
}) {
  const [state, formAction] = useActionState(action, idleActionState);
  const fieldErrors = fieldErrorsOf(state);
  const values = valuesOf(state);

  useEffect(() => {
    if (state.status === "success") {
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage state={state} />
      <FormField label="Name" htmlFor="name" errors={fieldErrors.name}>
        <Input
          id="name"
          name="name"
          defaultValue={values.name ?? customer?.name ?? ""}
          placeholder="Ada Okafor"
          autoFocus
          required
        />
      </FormField>
      <FormField
        label="Phone number"
        htmlFor="phoneNumber"
        errors={fieldErrors.phoneNumber}
      >
        <Input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          defaultValue={values.phoneNumber ?? customer?.phoneNumber ?? ""}
          placeholder="0803 123 4567"
        />
      </FormField>
      <FormField label="Email" htmlFor="email" errors={fieldErrors.email}>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={values.email ?? customer?.email ?? ""}
          placeholder="ada@example.com"
        />
      </FormField>
      <FormField label="Notes" htmlFor="notes" errors={fieldErrors.notes}>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={values.notes ?? customer?.notes ?? ""}
          placeholder="Measurements, preferences, anything useful"
        />
      </FormField>
      <div className="flex justify-end">
        <SubmitButton>{customer ? "Save changes" : "Add customer"}</SubmitButton>
      </div>
    </form>
  );
}
