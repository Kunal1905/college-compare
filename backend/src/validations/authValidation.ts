import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long.")
    .max(80, "Name must be under 80 characters."),
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long.")
    .max(128, "Password must be under 128 characters."),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long.")
    .max(128, "Password must be under 128 characters."),
});
