"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, User, Mail, Lock, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm, UseFormSetValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterData } from "@/lib/validations/register";
import api from "@/lib/axios";
import { toast } from "sonner";

function ReferralPrefill({ setValue }: { setValue: UseFormSetValue<RegisterData & { username?: string }> }) {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");
  if (refCode) setValue("referralCode", refCode.trim().toUpperCase());
  return null;
}

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, setValue, getValues, formState: { errors, isSubmitting } } = useForm<RegisterData & { username?: string }>({ resolver: zodResolver(registerSchema) as any });

  const onSubmit = async (data: RegisterData & { username?: string }) => {
    try {
      // Keep the existing registration payload intact while also forwarding the
      // username field shown in the new UI when the backend supports it.
      const payload = { ...data, username: getValues("username") };
      const response: any = await api.post("/auth/register", payload);
      toast.success(response?.message ?? "Registration Successful");
      router.push("/login");
    } catch (error: any) {
      toast.error(Array.isArray(error.response?.data?.message) ? error.response.data.message.join("\n") : error.response?.data?.message ?? "Registration Failed");
    }
  };

  const input = "h-11.5 w-full rounded-[9px] border border-slate-200 bg-white pl-11 pr-11 text-[12px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-[#0a1725] dark:text-white dark:placeholder:text-slate-500";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
      <Suspense fallback={null}><ReferralPrefill setValue={setValue} /></Suspense>

      <Field label="Full Name" icon={<User className="h-[16px] w-[16px]" />} error={errors.name?.message}>
        <input type="text" placeholder="Enter your full name" className={input} {...register("name")} />
      </Field>

      <Field label="Email Address" icon={<Mail className="h-[16px] w-[16px]" />} error={errors.email?.message}>
        <input type="email" placeholder="Enter your email address" className={input} {...register("email")} />
      </Field>

      <Field label="Username" icon={<User className="h-[16px] w-[16px]" />} error={(errors as any).username?.message}>
        <input type="text" placeholder="Choose a username" className={input} {...(register as any)("username")} />
      </Field>

      <Field label="Password" icon={<Lock className="h-[16px] w-[16px]" />} error={errors.password?.message}>
        <input type={showPassword ? "text" : "password"} placeholder="Create a strong password" className={input} {...register("password")} />
        <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
      </Field>

      <Field label="Confirm Password" icon={<Lock className="h-[16px] w-[16px]" />} error={errors.confirmPassword?.message}>
        <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" className={input} {...register("confirmPassword")} />
        <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500" aria-label={showConfirmPassword ? "Hide password" : "Show password"}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
      </Field>

      <Field label={<>Referral Code <span className="font-normal text-slate-400">(Optional)</span></>} icon={<Gift className="h-[16px] w-[16px]" />}>
        <input type="text" placeholder="Enter referral code" className={input} {...register("referralCode")} />
      </Field>

      <label className="flex items-start gap-2 pt-1 text-[10px] leading-4 text-slate-500 dark:text-slate-400">
        <input type="checkbox" className="mt-0.5 accent-orange-500" {...register("terms")} />
        <span>I agree to the <Link href="/terms" className="font-semibold text-orange-500">Terms of Service</Link> and <Link href="/privacy" className="font-semibold text-orange-500">Privacy Policy</Link></span>
      </label>
      {errors.terms && <p className="text-[11px] text-red-500">{errors.terms.message}</p>}

      <Button disabled={isSubmitting} type="submit" className="h-11.5 w-full rounded-[9px] bg-orange-500 text-[12px] font-bold text-white shadow-[0_8px_22px_rgba(249,115,22,.2)] hover:bg-orange-600">
        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</> : <>Create Account <span className="ml-2">→</span></>}
      </Button>

      <Divider />

      <Button type="button" variant="outline" className="h-11.5 w-full rounded-[9px] border-slate-200 bg-white text-[12px] font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#0a1725] dark:text-white dark:hover:bg-slate-800">
        <GoogleIcon /> Continue with Google
      </Button>

      <p className="pt-0.5 text-center text-[11px] text-slate-500 dark:text-slate-400">
        Already have an account?
        <Link href="/login" className="ml-1.5 font-bold text-orange-500 hover:text-orange-600">Login</Link>
      </p>
    </form>
  );
}

function Field({ label, icon, error, children }: { label: React.ReactNode; icon: React.ReactNode; error?: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-[10px] font-semibold text-slate-600 dark:text-slate-300">{label}</label><div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">{icon}</span>{children}</div>{error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}</div>;
}

function Divider() { return <div className="relative py-0.5"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div><div className="relative flex justify-center"><span className="bg-white px-3 text-[9px] uppercase text-slate-400 dark:bg-[#071321] dark:text-slate-500">or continue with</span></div></div>; }
function GoogleIcon() { return <svg className="mr-2.5 h-5 w-5" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.7-5.2l-6.3-5.3C29.4 35 26.9 36 24 36c-5.3 0-9.7-3.3-11.4-8H6.1C9.3 39.4 15.9 44 24 44z"/><path fill="#1976D2" d="M43.6 20H42V20H24v8h11.3c-1 2.9-3.1 5.2-5.9 6.7l.1-.1 6.3 5.3C35.4 39.6 44 34 44 24c0-1.3-.1-2.7-.4-4z"/></svg>; }
