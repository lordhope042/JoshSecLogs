import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, "Full name must be at least 3 characters"),

    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must not exceed 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers and underscores",
      ),

    email: z
      .string()
      .email("Please enter a valid email address"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),

    confirmPassword: z.string(),

    referralCode: z.string().optional(),

    terms: z.boolean().refine((value) => value === true, {
      message: "You must accept the Terms & Conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterData = z.infer<typeof registerSchema>;