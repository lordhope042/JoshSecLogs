import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, "Enter your username or email"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type LoginData = z.infer<typeof loginSchema>;