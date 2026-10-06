"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginData } from "@/lib/validations/login";
import api from "@/lib/axios";
import { toast } from "sonner";
import { markJustLoggedIn } from "@/hooks/useWelcomeNotification";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginData) {
    try {
      const res = await api.post("/auth/login", data);
      const { accessToken, user, isFirstLogin } = res as unknown as {
        accessToken: string;
        user: { name: string; role: string };
        isFirstLogin?: boolean;
      };

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      markJustLoggedIn(isFirstLogin);
      toast.success(`Welcome back ${user.name}!`);

      if (user.role === "ADMIN") {
        router.replace("/admin");
        return;
      }

      const redirect = searchParams.get("redirect");
      if (redirect && redirect.startsWith("/")) {
        router.replace(redirect);
        return;
      }

      router.replace("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Invalid email or password.");
    }
  }

  const input = "h-12 w-full rounded-[9px] border border-slate-200 bg-white pl-11 pr-11 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-[#0a1725] dark:text-white dark:placeholder:text-slate-500";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field label="Email or Username" icon={<Mail className="h-[17px] w-[17px]" />} error={errors.email?.message}>
        <input type="text" placeholder="Enter your email or username" className={input} {...register("email")} />
      </Field>

      <Field label="Password" icon={<Lock className="h-[17px] w-[17px]" />} error={errors.password?.message}>
        <input type={showPassword ? "text" : "password"} placeholder="Enter your password" className={input} {...register("password")} />
        <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-orange-500" aria-label={showPassword ? "Hide password" : "Show password"}>
          {showPassword ? <EyeOff className="h-[17px] w-[17px]" /> : <Eye className="h-[17px] w-[17px]" />}
        </button>
      </Field>

      <div className="-mt-1 flex items-center justify-end">
        <Link href="/forgot-password" className="text-[11px] font-semibold text-orange-500 hover:text-orange-600">Forgot password?</Link>
      </div>

      <Button disabled={isSubmitting} type="submit" className="h-12 w-full rounded-[9px] bg-orange-500 text-[13px] font-bold text-white shadow-[0_8px_22px_rgba(249,115,22,.2)] hover:bg-orange-600">
        {isSubmitting ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Signing In...</> : <>Login <span className="ml-2">→</span></>}
      </Button>

      <Divider />

      <Button type="button" variant="outline" className="h-12 w-full rounded-[9px] border-slate-200 bg-white text-[13px] font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#0a1725] dark:text-white dark:hover:bg-slate-800">
        <GoogleIcon /> Continue with Google
      </Button>

      <p className="pt-1 text-center text-[12px] text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?
        <Link href="/register" className="ml-1.5 font-bold text-orange-500 hover:text-orange-600">Register</Link>
      </p>
    </form>
  );
}

function Field({ label, icon, error, children }: { label: string; icon: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">{icon}</span>
        {children}
      </div>
      {error && <p className="mt-1.5 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function Divider() {
  return <div className="relative py-0.5"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div><div className="relative flex justify-center"><span className="bg-white px-3 text-[10px] uppercase tracking-wide text-slate-400 dark:bg-[#071321] dark:text-slate-500">or continue with</span></div></div>;
}

function GoogleIcon() {
  return <svg className="mr-2.5 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-.9 2.4-2 3.2l3.2 2.5c1.9-1.8 3-4.4 3-7.6 0-.7-.1-1.4-.2-2H12z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.5l-3.2-2.5c-.9.6-2 .9-3.5.9-2.7 0-5-1.8-5.8-4.3H2.9v2.7A10 10 0 0012 22z"/><path fill="#FBBC05" d="M6.2 13.6A6 6 0 016 12c0-.6.1-1.1.2-1.6V7.7H2.9A10 10 0 002 12c0 1.6.4 3.2.9 4.3l3.3-2.7z"/><path fill="#4285F4" d="M12 6c1.5 0 2.9.5 4 1.6l3-3A10 10 0 0012 2 10 10 0 002.9 7.7l3.3 2.7C7 7.8 9.3 6 12 6z"/></svg>;
}
