"use server";

import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { credentialsSchema, signUpSchema } from "@/features/auth/schema";
import {
  type ActionState,
  actionError,
  actionValidationError,
} from "@/lib/action-state";
import { hashPassword } from "@/lib/password";
import { formDataToObject } from "@/lib/validation";

const invalidCredentialsMessage = "Email or password is incorrect";

async function signInWithCredentials(email: string, password: string) {
  let result: unknown;
  try {
    result = await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return false;
    }
    throw error;
  }
  return !(typeof result === "string" && result.includes("error="));
}

export async function signInWithPassword(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const values = formDataToObject(formData);
  const safeValues = { email: values.email ?? "" };
  const parsed = credentialsSchema.safeParse(values);
  if (!parsed.success) {
    return actionValidationError(parsed.error, safeValues);
  }

  const signedIn = await signInWithCredentials(
    parsed.data.email,
    parsed.data.password,
  );
  if (!signedIn) {
    return actionError(invalidCredentialsMessage, safeValues);
  }

  redirect("/dashboard");
}

export async function signUp(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const values = formDataToObject(formData);
  const safeValues = { name: values.name ?? "", email: values.email ?? "" };
  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success) {
    return actionValidationError(parsed.error, safeValues);
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);
  if (existing.length > 0) {
    return {
      status: "error",
      message: null,
      fieldErrors: { email: ["An account with this email already exists"] },
      values: safeValues,
    };
  }

  await db.insert(users).values({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash: await hashPassword(parsed.data.password),
  });

  const signedIn = await signInWithCredentials(
    parsed.data.email,
    parsed.data.password,
  );
  if (!signedIn) {
    redirect("/sign-in");
  }

  redirect("/dashboard");
}
