import { z } from "zod";

export type FormValues = Record<string, string>;

export type ActionState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message: string | null;
      fieldErrors: Record<string, string[] | undefined>;
      values: FormValues;
    };

export const idleActionState: ActionState = { status: "idle" };

export const successActionState: ActionState = { status: "success" };

export function fieldErrorsOf(
  state: ActionState,
): Record<string, string[] | undefined> {
  return state.status === "error" ? state.fieldErrors : {};
}

export function valuesOf(state: ActionState): FormValues {
  return state.status === "error" ? state.values : {};
}

export function actionError(
  message: string,
  values: FormValues = {},
): ActionState {
  return { status: "error", message, fieldErrors: {}, values };
}

export function actionValidationError(
  error: z.ZodError,
  values: FormValues,
): ActionState {
  const { formErrors, fieldErrors } = z.flattenError(error);
  return {
    status: "error",
    message: formErrors[0] ?? null,
    fieldErrors,
    values,
  };
}
