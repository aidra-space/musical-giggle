import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(200, "Password is too long");

export const credentialsSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(200, "Name is too long"),
  email: emailSchema,
  password: passwordSchema,
});
