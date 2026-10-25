"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";

  return (
    <header className="sticky top-0 z-40 bg-transparent backdrop-blur-md ">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1"
          >
            <span className="font-extrabold ">SettleAI</span>
            <span className="text-[#00c2ff] text-3xl leading-none">.</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 ml-10">
          <Link href="/" className="hover:text-slate-900 transition">
            Home
          </Link>
          <a href="/#how-it-works" className="hover:text-slate-900 transition">
            How it works
          </a>
          <a href="/#key-benefits" className="hover:text-slate-900 transition">
            Key benefits
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {isDashboard ? (
            <Link
              href="/"
              className="text-sm font-semibold text-slate-700 px-5 py-2.5 rounded-full border border-slate-300 hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <span>←</span>
              <span>Back to Overview</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-block text-sm font-semibold text-slate-700 px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-50 transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-[#0f172b] text-white text-sm font-semibold px-6 py-2.5 rounded-full  hover:bg-[#334155] "
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
