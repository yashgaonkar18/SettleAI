import AuthView from "@/components/auth/AuthView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - SettleAI",
  description: "Create your SettleAI account to automate overdue invoice recovery with AI.",
};

export default function SignupPage() {
  return <AuthView initialMode="signup" />;
}
