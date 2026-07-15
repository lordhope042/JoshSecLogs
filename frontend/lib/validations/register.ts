import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, "Full name must be at least 3 characters"),

    email: z
      .string()
      .email("Please enter a valid email address"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),

    confirmPassword: z.string(),

    referralCode: z.string().optional(),

    terms: z
      .boolean()
      .refine((val) => val === true, {
        message: "You must accept the Terms & Conditions",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterData = z.infer<typeof registerSchema>;