"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormField, FormMessage, SubmitButton } from "@/components/form";
import { Input } from "@/components/ui/input";
import { signInWithPassword } from "@/features/auth/actions";
import { fieldErrorsOf, idleActionState, valuesOf } from "@/lib/action-state";

export function SignInForm() {
  const [state, formAction] = useActionState(signInWithPassword, idleActionState);
  const fieldErrors = fieldErrorsOf(state);
  const values = valuesOf(state);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage state={state} />
      <FormField label="Email" htmlFor="email" errors={fieldErrors.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={values.email ?? ""}
          placeholder="you@example.com"
          autoFocus
          required
        />
      </FormField>
      <FormField label="Password" htmlFor="password" errors={fieldErrors.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </FormField>
      <SubmitButton className="w-full" pendingText="Signing in…">
        Sign in
      </SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/sign-up" className="font-medium text-foreground hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
