"use client";

import { Suspense } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

// LoginForm uses useSearchParams() (to read ?redirect=/shop etc.),
// which requires a Suspense boundary so the page can opt out of
// full static prerendering during `next build`.
export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Login to access your dashboard."
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
