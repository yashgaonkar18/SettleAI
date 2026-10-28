"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const parseProfile = (user: any): UserProfile => {
      const fullName =
        user.user_metadata?.full_name || user.user_metadata?.name || "";
      const email = user.email || "";
      let initials = "U";
      if (fullName) {
        const parts = fullName.trim().split(" ");
        initials =
          parts.length > 1
            ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
            : parts[0].slice(0, 2).toUpperCase();
      } else if (email) {
        initials = email.slice(0, 2).toUpperCase();
      }

      return {
        name: fullName || (email ? email.split("@")[0] : "User"),
        email,
        avatarUrl:
          user.user_metadata?.avatar_url || user.user_metadata?.picture,
        initials,
      };
    };

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      if (data?.user) {
        setUserProfile(parseProfile(data.user));
      } else {
        setUserProfile(null);
      }
      setIsLoadingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUserProfile(parseProfile(session.user));
      } else {
        setUserProfile(null);
      }
      setIsLoadingAuth(false);
    });

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await supabase.auth.signOut();
    setUserProfile(null);
    router.push("/");
    router.refresh();
  };

  const handleAnchor = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    const smoother = ScrollSmoother.get();
    if (smoother && pathname === "/") {
      e.preventDefault();
      smoother.scrollTo(id, true, "top 80px");
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/60 backdrop-blur-md ">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1"
          >
            <span className="font-extrabold">SettleAI</span>
            <span className="text-[#00c2ff] text-3xl leading-none">.</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 ml-10">
          <Link href="/" className="hover:text-slate-900 transition">
            Home
          </Link>
          <a
            href="/#how-it-works"
            onClick={(e) => handleAnchor(e, "#how-it-works")}
            className="hover:text-slate-900 transition"
          >
            How it works
          </a>
          <a
            href="/#key-benefits"
            onClick={(e) => handleAnchor(e, "#key-benefits")}
            className="hover:text-slate-900 transition"
          >
            Key benefits
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {isLoadingAuth ? (
            <div className="h-9 w-24 rounded-full bg-slate-100 animate-pulse" />
          ) : userProfile ? (
            <div className="flex items-center gap-3">
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-slate-200 bg-white hover:border-slate-300 shadow-sm transition cursor-pointer"
                  aria-label="User account menu"
                  title={userProfile.email}
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-tr from-[#0070ba] to-[#00c2ff] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {userProfile.avatarUrl ? (
                      <img
                        src={userProfile.avatarUrl}
                        alt={userProfile.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span>{userProfile.initials}</span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate hidden md:inline-block">
                    {userProfile.name}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`text-slate-400 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white p-2 shadow-2xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                    <div className="px-3 py-2.5 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate text-sm">
                        {userProfile.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {userProfile.email}
                      </p>
                    </div>

                    <div className="py-1.5 space-y-0.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-950 font-medium transition"
                      >
                        <LayoutDashboard size={14} className="text-slate-400" />
                        <span>Go to Dashboard</span>
                      </Link>

                      <Link
                        href="/dashboard/invoices"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-950 font-medium transition"
                      >
                        <FileText size={14} className="text-slate-400" />
                        <span>My Invoices</span>
                      </Link>

                      <Link
                        href="/dashboard/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-950 font-medium transition"
                      >
                        <Settings size={14} className="text-slate-400" />
                        <span>Account Settings</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition font-medium cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
                className="bg-[#0f172b] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#334155] transition"
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