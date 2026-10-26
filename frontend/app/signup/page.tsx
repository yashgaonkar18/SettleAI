import { Suspense } from "react";
import AuthView from "@/components/auth/AuthView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - SettleAI",
  description: "Create your SettleAI account to automate overdue invoice recovery with AI.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa]" />}>
      <AuthView initialMode="signup" />
    </Suspense>
  );
}
