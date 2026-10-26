import { Suspense } from "react";
import AuthView from "@/components/auth/AuthView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - SettleAI",
  description: "Sign in to your SettleAI account to manage invoices and PayPal payments.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa]" />}>
      <AuthView initialMode="login" />
    </Suspense>
  );
}
