import AuthView from "@/components/auth/AuthView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - SettleAI",
  description: "Sign in to your SettleAI account to manage invoices and PayPal payments.",
};

export default function LoginPage() {
  return <AuthView initialMode="login" />;
}
