"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm"; // ← Capital 'R'

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Purchase premium virtual numbers, social media accounts, and secure digital products in minutes."
    >
      <RegisterForm />
    </AuthLayout>
  );
}