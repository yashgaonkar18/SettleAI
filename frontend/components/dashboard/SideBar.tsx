"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Zap, ArrowUpRight } from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "/home.svg",
  },
  {
    label: "New Invoice",
    href: "/dashboard/new-invoice",
    icon: "/add.svg",
  },
  {
    label: "Invoices",
    href: "/dashboard/invoices",
    icon: "/receipt.svg",
  },
  {
    label: "Reminders",
    href: "/dashboard/reminders",
    icon: "/notifications.svg",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: "/settings.svg",
  },
];

export default function SideBar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-slate-200/80 bg-white/95 p-4 backdrop-blur-md">
      <Link
        href="/dashboard"
        className="mb-10 mt-3 flex items-center justify-center text-3xl font-black text-slate-900"
      >
        <span className="tracking-tight">SettleAI</span>
        <span className="text-4xl leading-none text-[#00c2ff]">.</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive
                  ? "bg-[#00d2ff]/15 text-slate-950"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
            >
              <Image
                src={item.icon}
                alt=""
                width={22}
                height={22}
                className="shrink-0"
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="relative mb-4 mt-8 flex w-full flex-col gap-3 rounded-2xl bg-[#00d2ff] p-4 pt-7">
        <div className="absolute -top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-white">
          <Zap size={28} className="fill-[#0b0f19] text-[#0b0f19]" />
        </div>

        <h2 className="pt-1 text-2xl font-bold leading-tight text-black">
          Smarter follow-ups
        </h2>

        <p className="text-sm text-slate-800">
          AI reminders coming soon.
        </p>

        <Link
          href="/dashboard/reminders"
          className="flex w-full items-center justify-between gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
        >
          <span>Learn more</span>
          <ArrowUpRight size={20} className="shrink-0" />
        </Link>
      </div>
    </aside>
  );
}