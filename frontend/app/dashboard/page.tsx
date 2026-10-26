"use client";

import { ArrowUp, Clock, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/dashboard/SearchBar";
import StatCard from "@/components/dashboard/StatCard";
import CashFlowHero from "@/components/dashboard/CashFlowHero";
import InvoiceTable from "@/components/dashboard/InvoiceTable";
import { Invoice, ReminderDraft } from "@/components/dashboard/types";
import {
  fetchInvoices,
  fetchDashboardStats,
  fetchReminders,
  generateReminderDraft,
  updateInvoiceStatus,
  DashboardStats,
} from "@/lib/api";
import { supabase } from "@/lib/supabase/client";

interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isReminderQueueOpen, setIsReminderQueueOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const u = data.user;
        const fullName = u.user_metadata?.full_name || u.user_metadata?.name || "";
        const email = u.email || "";
        let initials = "YG";
        if (fullName) {
          const parts = fullName.trim().split(" ");
          initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0].slice(0, 2).toUpperCase();
        } else if (email) {
          initials = email.slice(0, 2).toUpperCase();
        }

        setUserProfile({
          name: fullName || email.split("@")[0],
          email,
          avatarUrl: u.user_metadata?.avatar_url || u.user_metadata?.picture,
          initials,
        });
      }
    };

    loadUser();

    setIsLoading(true);
    Promise.all([
      fetchInvoices()
        .then((data) => setInvoices(data || []))
        .catch(() => setInvoices([])),
      fetchReminders()
        .then((data) => setReminderDrafts(data || []))
        .catch(() => setReminderDrafts([])),
      fetchDashboardStats()
        .then((data) => setStats(data))
        .catch(() => setStats(null)),
    ]).finally(() => setIsLoading(false));

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reminderDrafts, setReminderDrafts] = useState<ReminderDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleSendReminderFromTable = async (invoice: Invoice) => {
    try {
      const draft = await generateReminderDraft(invoice.id);
      setReminderDrafts([draft, ...reminderDrafts.filter((r) => r.invoiceId !== invoice.id)]);
      setIsReminderQueueOpen(true);
    } catch (err) {
      console.warn("Could not generate reminder draft with backend:", err);
      setIsReminderQueueOpen(true);
    }
  };


  const receivedAmount = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  const expectedAmount = invoices
    .filter((i) => i.status === "sent")
    .reduce((sum, i) => sum + i.amount, 0);

  const overdueInvoices = invoices.filter((i) => i.status === "overdue");
  const overdueAmount = overdueInvoices.reduce((sum, i) => sum + i.amount, 0);

  const handleMarkAsPaid = async (invoiceId: string) => {
    setInvoices(
      invoices.map((inv) => (inv.id === invoiceId ? { ...inv, status: "paid" } : inv))
    );
    setReminderDrafts(reminderDrafts.filter((r) => r.invoiceId !== invoiceId));
    try {
      await updateInvoiceStatus(invoiceId, "paid");
      const updatedStats = await fetchDashboardStats();
      setStats(updatedStats);
    } catch (err) {
      console.warn("Backend update error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex items-center justify-between mb-8">
          <SearchBar />
          <div className="flex gap-6 items-center">
            <StatCard
              label="Received"
              amount={stats?.receivedAmount ?? receivedAmount}
              variant="received"
              icon={<ArrowUp size={20} strokeWidth={2.5} />}
            />
            <StatCard
              label="Overdue"
              amount={stats?.overdueCount ?? overdueInvoices.length}
              variant="overdue"
              icon={<Clock size={20} strokeWidth={2.5} />}
            />
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#0070ba] to-[#00c2ff] text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-sm hover:ring-2 hover:ring-slate-300 transition overflow-hidden border border-slate-200"
                title={userProfile?.email || "User Profile"}
                aria-label="User menu"
              >
                {userProfile?.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{userProfile?.initials || "YG"}</span>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-2xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900 truncate">
                      {userProfile?.name || "Yash Gaonkar"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {userProfile?.email || "yash@settleai.dev"}
                    </p>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition cursor-pointer font-medium"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <CashFlowHero
          userName={userProfile?.name?.split(" ")[0] || "Yash"}
          receivedAmount={stats?.receivedAmount ?? receivedAmount}
          expectedAmount={stats?.expectedAmount ?? expectedAmount}
          atRiskAmount={stats?.overdueAmount ?? overdueAmount}
          receivedInvoices={invoices.filter((i) => i.status === "paid").length}
          expectedInvoices={invoices.filter((i) => i.status === "sent").length}
          atRiskInvoices={overdueInvoices.length}
          insightText={stats?.insightText || "All client invoices are currently up to date."}
          onViewInvoices={() => { }}
        />
        <InvoiceTable
          invoices={invoices}
          onSendReminder={handleSendReminderFromTable}
          onMarkAsPaid={handleMarkAsPaid}
        />
      </div>



    </div>
  );
}
