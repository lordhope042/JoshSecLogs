"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm"; // ← Capital 'R'

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join JoshSecLogs and get started today"
    >
      <RegisterForm />
    </AuthLayout>
  );
}