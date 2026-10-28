"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormField, FormMessage, SubmitButton } from "@/components/form";
import { Input } from "@/components/ui/input";
import { signUp } from "@/features/auth/actions";
import { fieldErrorsOf, idleActionState, valuesOf } from "@/lib/action-state";

export function SignUpForm() {
  const [state, formAction] = useActionState(signUp, idleActionState);
  const fieldErrors = fieldErrorsOf(state);
  const values = valuesOf(state);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage state={state} />
      <FormField label="Your name" htmlFor="name" errors={fieldErrors.name}>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          defaultValue={values.name ?? ""}
          placeholder="Ada Okafor"
          autoFocus
          required
        />
      </FormField>
      <FormField label="Email" htmlFor="email" errors={fieldErrors.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={values.email ?? ""}
          placeholder="you@example.com"
          required
        />
      </FormField>
      <FormField
        label="Password"
        htmlFor="password"
        errors={fieldErrors.password}
        hint="At least 8 characters"
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </FormField>
      <SubmitButton className="w-full" pendingText="Creating account…">
        Create account
      </SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
