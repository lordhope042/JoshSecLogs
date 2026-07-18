"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Gift,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useForm, UseFormSetValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  registerSchema,
  RegisterData,
} from "@/lib/validations/register";

import api from "@/lib/axios";
import { toast } from "sonner";

// Isolated so only this small piece needs the Suspense boundary
// useSearchParams() requires in the Next.js App Router — the rest
// of the form renders immediately without waiting on it.
function ReferralPrefill({
  setValue,
}: {
  setValue: UseFormSetValue<RegisterData>;
}) {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");

  if (refCode) {
    setValue("referralCode", refCode.trim().toUpperCase());
  }

  return null;
}

export default function RegisterForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterData) => {
    try {
      const response = await api.post(
        "/auth/register",
        data
      );

      toast.success(
        response.data?.message ??
          "Registration Successful"
      );

      router.push("/login");

    } catch (error: any) {
      toast.error(
        Array.isArray(error.response?.data?.message)
          ? error.response.data.message.join("\n")
          : error.response?.data?.message ??
              "Registration Failed"
      );
    }
  };

  const inputStyle =
    "peer h-14 w-full rounded-2xl border border-zinc-700 bg-[#0f1729]/70 pl-12 pr-4 text-white placeholder:text-zinc-500 transition-all duration-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

  return (

<div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-[#0a1020]/90 p-8 backdrop-blur-2xl">

<div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl"/>

<div className="absolute -right-24 bottom-0 h-60 w-60 rounded-full bg-orange-500/10 blur-3xl"/>

<div className="relative z-10">

<Suspense fallback={null}>
  <ReferralPrefill setValue={setValue} />
</Suspense>

<div className="mb-8">

<div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-400">

<ShieldCheck size={16}/>

Trusted Platform

</div>

<h2 className="text-4xl font-black text-white">

Create Your Account

</h2>

<p className="mt-3 leading-7 text-zinc-400">

Create an account to purchase Virtual Numbers,
Premium Social Media Accounts,
Digital Logs and access your dashboard instantly.

</p>

</div>

<form
onSubmit={handleSubmit(onSubmit)}
className="space-y-6"
>

{/* Name */}

<div>

<label className="mb-2 block text-sm font-medium text-zinc-300">

Full Name

</label>

<div className="relative">

<User
size={19}
className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
/>

<input
type="text"
placeholder="John Doe"
className={inputStyle}
{...register("name")}
/>

</div>

{errors.name && (

<p className="mt-2 text-sm text-red-500">

{errors.name.message}

</p>

)}

</div>

{/* Email */}

<div>

<label className="mb-2 block text-sm font-medium text-zinc-300">

Email Address

</label>

<div className="relative">

<Mail
size={19}
className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
/>

<input
type="email"
placeholder="john@example.com"
className={inputStyle}
{...register("email")}
/>

</div>

{errors.email && (

<p className="mt-2 text-sm text-red-500">

{errors.email.message}

</p>

)}

</div>

{/* Password */}

<div>

<label className="mb-2 block text-sm font-medium text-zinc-300">

Password

</label>

<div className="relative">

<Lock
size={19}
className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
/>

<input
type={
showPassword
? "text"
: "password"
}
placeholder="Enter Password"
className={`${inputStyle} pr-12`}
{...register("password")}
/>

<button
type="button"
onClick={() =>
setShowPassword(!showPassword)
}
className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-orange-500"
>

{showPassword
? <EyeOff size={18}/>
: <Eye size={18}/>
}

</button>

</div>

<p className="mt-2 text-xs text-zinc-500">

Use at least 8 characters with numbers and symbols.

</p>

{errors.password && (

<p className="mt-2 text-sm text-red-500">

{errors.password.message}

</p>

)}

</div>
{/* Confirm Password */}

<div>

  <label className="mb-2 block text-sm font-medium text-zinc-300">
    Confirm Password
  </label>

  <div className="relative">

    <Lock
      size={19}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
    />

    <input
      type={showConfirmPassword ? "text" : "password"}
      placeholder="Confirm Password"
      className={`${inputStyle} pr-12`}
      {...register("confirmPassword")}
    />

    <button
      type="button"
      onClick={() =>
        setShowConfirmPassword(!showConfirmPassword)
      }
      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-orange-500"
    >
      {showConfirmPassword ? (
        <EyeOff size={18} />
      ) : (
        <Eye size={18} />
      )}
    </button>

  </div>

  {errors.confirmPassword && (
    <p className="mt-2 text-sm text-red-500">
      {errors.confirmPassword.message}
    </p>
  )}

</div>

{/* Referral Code */}

<div>

  <label className="mb-2 block text-sm font-medium text-zinc-300">
    Referral Code
    <span className="ml-2 text-zinc-500">(Optional)</span>
  </label>

  <div className="relative">

    <Gift
      size={19}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
    />

    <input
      type="text"
      placeholder="Referral Code"
      className={inputStyle}
      {...register("referralCode")}
    />

  </div>

</div>

{/* Terms */}

<div>

  <label className="flex items-start gap-3 rounded-2xl border border-zinc-700 bg-[#101826]/50 p-4 transition hover:border-orange-500/50">

    <input
      type="checkbox"
      className="mt-1 accent-orange-500"
      {...register("terms")}
    />

    <div>

      <p className="text-sm leading-6 text-zinc-400">
        I agree to the{" "}
        <Link
          href="/terms"
          className="font-semibold text-orange-500 hover:underline"
        >
          Terms & Conditions
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="font-semibold text-orange-500 hover:underline"
        >
          Privacy Policy
        </Link>.
      </p>

      {errors.terms && (
        <p className="mt-2 text-sm text-red-500">
          {errors.terms.message}
        </p>
      )}

    </div>

  </label>

</div>

{/* Register Button */}

<Button
  type="submit"
  disabled={isSubmitting}
  className="h-14 w-full rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-lg font-semibold shadow-lg shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-orange-500/50 disabled:cursor-not-allowed disabled:opacity-70"
>

  {isSubmitting ? (
    <>
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Creating Account...
    </>
  ) : (
    "Create Account"
  )}

</Button>

{/* Divider */}

<div className="relative py-2">

  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-zinc-700"></div>
  </div>

  <div className="relative flex justify-center">
    <span className="bg-[#0a1020] px-5 text-sm text-zinc-500">
      OR
    </span>
  </div>

</div>

{/* Google */}

<Button
  type="button"
  variant="outline"
  className="h-14 w-full rounded-2xl border-zinc-700 bg-[#101826] text-white transition hover:border-orange-500 hover:bg-[#172236]"
>

  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="mr-3 h-5 w-5"
  >
    <path fill="#FFC107" d="M43.6 20H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.7-5.2l-6.3-5.3C29.4 35 26.9 36 24 36c-5.3 0-9.7-3.3-11.4-8H6.1C9.3 39.4 15.9 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20H42V20H24v8h11.3c-1 2.9-3.1 5.2-5.9 6.7l.1-.1 6.3 5.3C35.4 39.6 44 34 44 24c0-1.3-.1-2.7-.4-4z"/>
  </svg>

  Continue with Google

</Button>

{/* Login */}

<p className="pt-4 text-center text-sm text-zinc-400">

  Already have an account?

  <Link
    href="/login"
    className="ml-2 font-semibold text-orange-500 transition hover:text-orange-400"
  >
    Sign In
  </Link>

</p>

</form>

</div>

</div>
);
}
