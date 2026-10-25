"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

interface AuthViewProps {
  initialMode?: "login" | "signup";
}

export default function AuthView({ initialMode = "login" }: AuthViewProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }

        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name.trim() || undefined,
            },
            emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
          },
        });

        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }

        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setSuccessMessage("Account created successfully! Please check your email inbox to confirm your account.");
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected authentication error occurred.");
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github" | "Google" | "GitHub") => {
    setIsLoading(true);
    setErrorMessage("");
    const mappedProvider = provider.toLowerCase() as "google" | "github";
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: mappedProvider,
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "OAuth provider error.");
      setIsLoading(false);
    }
  };

  const slides = [
    {
      title: "Select & Combine & Integrate.",
      subtitle: "Automate invoice tracking, trigger smart PayPal payment links, and settle overdue invoices effortlessly.",
    },
    {
      title: "Autonomous Recovery Agents.",
      subtitle: "Let Gemini AI draft friendly payment reminders that maintain strong client relationships while getting you paid.",
    },
    {
      title: "Instant PayPal Settlement.",
      subtitle: "Direct integration with PayPal Orders v2 for instant sandbox and live payment reconciliation in real-time.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between text-slate-800 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-6">
        <div className="w-full max-w-md mx-auto flex flex-col justify-center">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 bg-[#0f172a] rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10 mb-4 transition transform hover:scale-105">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="5" />
                <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none" />
                <path d="M8.5 14.5c1 1.5 6 1.5 7 0" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {mode === "login" ? "Welcome to SettleAI" : "Create your SettleAI account"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              {mode === "login"
                ? "Please sign in or sign up with your Google account."
                : "Get started in seconds with Google or your email."}
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleOAuth("Google")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm transition active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              <span>{mode === "login" ? "Sign in with Google" : "Sign up with Google"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuth("GitHub")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm transition active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-4 h-4 fill-slate-900" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>{mode === "login" ? "Sign in with GitHub" : "Sign up with GitHub"}</span>
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-[#fafafa] px-3 text-slate-400 font-semibold">OR</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="grace@org.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  )}
                </button>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                  <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    !
                  </span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    ✓
                  </span>
                  <span>{successMessage}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-xs text-slate-600 font-medium">Remember me</span>
              </label>

              {mode === "login" && (
                <a href="#" className="text-xs font-semibold text-slate-900 hover:underline">
                  Forgot password?
                </a>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0d1527] hover:bg-[#1a243b] text-white font-medium text-sm py-2.5 rounded-xl shadow-sm transition active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === "login" ? (
                "Continue"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            {mode === "login" ? (
              <p className="text-xs text-slate-500">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMessage("");
                  }}
                  className="font-semibold text-slate-900 hover:underline cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMessage("");
                  }}
                  className="font-semibold text-slate-900 hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </p>
            )}
          </div>

          <div className="text-center mt-12 text-[11px] text-slate-400">
            By continuing, you agree to our{" "}
            <a href="#" className="underline font-medium hover:text-slate-600">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline font-medium hover:text-slate-600">
              Privacy Policy
            </a>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-center justify-between bg-white border border-slate-200/80 rounded-[32px] p-10 h-[620px] shadow-sm relative overflow-hidden">
          <div className="text-center max-w-sm mt-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {slides[activeSlide].title}
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {slides[activeSlide].subtitle}
            </p>
          </div>

          <div className="relative w-80 h-80 flex items-center justify-center my-auto">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 320">
              <line x1="60" y1="60" x2="160" y2="160" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="160" y1="40" x2="160" y2="160" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="260" y1="60" x2="160" y2="160" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="40" y1="160" x2="160" y2="160" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="280" y1="160" x2="160" y2="160" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="60" y1="260" x2="160" y2="160" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="160" y1="280" x2="160" y2="160" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="260" y1="260" x2="160" y2="160" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />

              <rect x="50" y="50" width="220" height="220" rx="20" fill="none" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="6 6" />
            </svg>

            <div className="relative z-10 w-16 h-16 bg-[#0f172a] rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/20 transform hover:scale-110 transition cursor-pointer group">
              <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="5" />
                <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" stroke="none" />
                <path d="M8.5 14.5c1 1.5 6 1.5 7 0" />
              </svg>
              <span className="absolute -inset-1 rounded-2xl bg-[#00c2ff]/20 animate-ping pointer-events-none" />
            </div>

            <div
              title="Meta & WhatsApp Notifications"
              className="absolute left-6 top-6 w-11 h-11 bg-white rounded-xl shadow-sm border border-slate-200/90 flex items-center justify-center hover:scale-110 hover:shadow-md transition cursor-pointer group"
            >
              <svg className="w-5 h-5 text-[#0081fb] fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5.16-1.31C8.58 21.52 10.24 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.57 0-3.04-.44-4.3-1.22l-.31-.19-3.16.8.84-3.07-.2-.32A7.95 7.95 0 0 1 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
              </svg>
            </div>

            <div
              title="Autonomous Agents"
              className="absolute top-2 left-1/2 -translate-x-1/2 w-11 h-11 bg-[#0f172a] rounded-xl shadow-sm border border-slate-900 flex items-center justify-center hover:scale-110 hover:shadow-md transition cursor-pointer"
            >
              <span className="text-white font-black text-sm tracking-tighter">R</span>
            </div>

            <div
              title="ElevenLabs Voice Reminders"
              className="absolute right-6 top-6 w-11 h-11 bg-white rounded-xl shadow-sm border border-slate-200/90 flex items-center justify-center hover:scale-110 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex gap-0.5 items-center">
                <span className="w-1 h-3.5 bg-slate-900 rounded-full" />
                <span className="w-1 h-5 bg-slate-900 rounded-full" />
                <span className="w-1 h-2 bg-slate-900 rounded-full" />
              </div>
            </div>

            <div
              title="OpenAI Intelligence"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-xl shadow-sm border border-slate-200/90 flex items-center justify-center hover:scale-110 hover:shadow-md transition cursor-pointer"
            >
              <svg className="w-5 h-5 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.28 10.36a5.53 5.53 0 0 0-.47-4.48 5.6 5.6 0 0 0-4.88-2.76 5.3 5.3 0 0 0-1.85.33A5.5 5.5 0 0 0 10.7 2a5.57 5.57 0 0 0-5.18 3.58 5.54 5.54 0 0 0-3.6 2.65 5.6 5.6 0 0 0 .53 6.07 5.53 5.53 0 0 0 .47 4.48 5.6 5.6 0 0 0 4.88 2.76 5.3 5.3 0 0 0 1.85-.33A5.5 5.5 0 0 0 14.1 22a5.57 5.57 0 0 0 5.18-3.58 5.54 5.54 0 0 0 3.6-2.65 5.6 5.6 0 0 0-.6-5.41z" />
              </svg>
            </div>

            <div
              title="Claude AI Reasoning"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#0f172a] rounded-xl shadow-sm border border-slate-900 flex items-center justify-center hover:scale-110 hover:shadow-md transition cursor-pointer"
            >
              <span className="text-white font-extrabold text-xs">AI</span>
            </div>

            <div
              title="Gemini AI Analysis"
              className="absolute left-6 bottom-6 w-11 h-11 bg-white rounded-xl shadow-sm border border-slate-200/90 flex items-center justify-center hover:scale-110 hover:shadow-md transition cursor-pointer"
            >
              <svg className="w-5 h-5 text-[#10a37f] fill-current" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A6 6 0 0 1 7.07 13H7a1 1 0 0 1 0-2h.07A6 6 0 0 1 11 7.07V7a1 1 0 0 1 2 0v.07A6 6 0 0 1 16.93 11H17a1 1 0 0 1 0 2h-.07A6 6 0 0 1 13 16.93z" />
              </svg>
            </div>

            <div
              title="PayPal Sandbox Orders v2"
              className="absolute bottom-2 left-1/2 -translate-x-1/2 w-11 h-11 bg-[#003087] rounded-xl shadow-sm border border-[#003087] flex items-center justify-center hover:scale-110 hover:shadow-md transition cursor-pointer"
            >
              <span className="text-[#00c2ff] font-black text-xs tracking-tighter">PP</span>
            </div>

            <div
              title="Stripe & Accounting Reconciliation"
              className="absolute right-6 bottom-6 w-11 h-11 bg-white rounded-xl shadow-sm border border-slate-200/90 flex items-center justify-center hover:scale-110 hover:shadow-md transition cursor-pointer"
            >
              <span className="text-[#635bff] font-black text-sm">S</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pb-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${activeSlide === idx ? "w-6 h-1.5 bg-slate-900" : "w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="w-full text-center py-2 text-[11px] text-slate-400">
        © 2026 SettleAI. Built for PayPal AI Hackathon.
      </div>
    </div>
  );
}
