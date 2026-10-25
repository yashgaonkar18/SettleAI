"use client";

import { ArrowUp, Clock, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/dashboard/SearchBar";
import StatCard from "@/components/dashboard/StatCard";
import CashFlowHero from "@/components/dashboard/CashFlowHero";
import InvoiceTable from "@/components/dashboard/InvoiceTable";
import { Invoice, ReminderDraft } from "@/components/dashboard/types";
import { fetchInvoices, fetchDashboardStats, updateInvoiceStatus, DashboardStats } from "@/lib/api";
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

    fetchInvoices()
      .then((data) => {
        if (data && data.length > 0) setInvoices(data);
      })
      .catch((err) => console.log("Using local invoices fallback:", err));

    fetchDashboardStats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch((err) => console.log("Using local stats fallback:", err));

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

  // Initial Mock Invoices
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "inv-1",
      invoiceNumber: "INV-2026-001",
      clientName: "Acme Corp",
      clientEmail: "billing@acme.com",
      amount: 1200,
      dueDate: "2026-10-14",
      daysLate: 9,
      status: "overdue",
      lineItems: [{ id: "l1", description: "Brand Identity & Design System", quantity: 1, rate: 1200, amount: 1200 }],
      paymentLink: "https://sandbox.paypal.com/checkout/ord_acme1200",
      createdAt: "2026-09-30",
    },
    {
      id: "inv-2",
      invoiceNumber: "INV-2026-002",
      clientName: "Nova Studio",
      clientEmail: "payments@novastudio.design",
      amount: 270,
      dueDate: "2026-10-19",
      daysLate: 4,
      status: "overdue",
      lineItems: [{ id: "l2", description: "Design Consultation (3 hrs)", quantity: 3, rate: 90, amount: 270 }],
      paymentLink: "https://sandbox.paypal.com/checkout/ord_nova270",
      createdAt: "2026-10-05",
    },
    {
      id: "inv-3",
      invoiceNumber: "INV-2026-003",
      clientName: "Pixel Craft",
      clientEmail: "finance@pixelcraft.co",
      amount: 2400,
      dueDate: "2026-10-28",
      status: "sent",
      lineItems: [{ id: "l3", description: "Fullstack Dashboard UI sprint", quantity: 1, rate: 2400, amount: 2400 }],
      paymentLink: "https://sandbox.paypal.com/checkout/ord_pixel2400",
      createdAt: "2026-10-14",
    },
    {
      id: "inv-4",
      invoiceNumber: "INV-2026-004",
      clientName: "Stripe Devs",
      clientEmail: "ops@stripedevs.com",
      amount: 1800,
      dueDate: "2026-11-04",
      status: "sent",
      lineItems: [{ id: "l4", description: "Webhooks Integration Architecture", quantity: 1, rate: 1800, amount: 1800 }],
      paymentLink: "https://sandbox.paypal.com/checkout/ord_stripe1800",
      createdAt: "2026-10-20",
    },
    {
      id: "inv-5",
      invoiceNumber: "INV-2026-005",
      clientName: "Apex Labs",
      clientEmail: "accounts@apexlabs.ai",
      amount: 4950,
      dueDate: "2026-10-21",
      status: "paid",
      lineItems: [{ id: "l5", description: "Gemini Model Fine-Tuning Pipeline", quantity: 1, rate: 4950, amount: 4950 }],
      paymentLink: "https://sandbox.paypal.com/checkout/ord_apex4950",
      createdAt: "2026-10-07",
    },
    {
      id: "inv-6",
      invoiceNumber: "INV-2026-006",
      clientName: "Horizon Media",
      clientEmail: "billing@horizonmedia.io",
      amount: 3500,
      dueDate: "2026-10-15",
      status: "paid",
      lineItems: [{ id: "l6", description: "Monthly Growth Retainer", quantity: 1, rate: 3500, amount: 3500 }],
      paymentLink: "https://sandbox.paypal.com/checkout/ord_horizon3500",
      createdAt: "2026-10-01",
    },
  ]);

  // Initial Mock Reminder Drafts
  const [reminderDrafts, setReminderDrafts] = useState<ReminderDraft[]>([
    {
      id: "rem-1",
      invoiceId: "inv-1",
      clientName: "Acme Corp",
      clientEmail: "billing@acme.com",
      amount: 1200,
      daysLate: 9,
      tone: "firm",
      subject: "Action Required: Overdue Invoice INV-2026-001 ($1,200.00)",
      message:
        "Hi Acme Corp team,\n\nThis is a quick notice that invoice INV-2026-001 for Brand Identity & Design System ($1,200.00) is now 9 days past due. To prevent any project pause, please settle via the instant PayPal link below.\n\nThank you for your prompt cooperation.",
      paymentLink: "https://sandbox.paypal.com/checkout/ord_acme1200",
      status: "pending_approval",
    },
    {
      id: "rem-2",
      invoiceId: "inv-2",
      clientName: "Nova Studio",
      clientEmail: "payments@novastudio.design",
      amount: 270,
      daysLate: 4,
      tone: "friendly",
      subject: "Friendly Reminder: Invoice INV-2026-002 ($270.00)",
      message:
        "Hi Nova Studio,\n\nHope your week is going great! Just following up on invoice INV-2026-002 ($270.00) for our recent design consultation session. You can conveniently pay in seconds using PayPal Orders v2.\n\nLet me know if you need any adjustments!",
      paymentLink: "https://sandbox.paypal.com/checkout/ord_nova270",
      status: "pending_approval",
    },
  ]);



  const handleSendReminderFromTable = (invoice: Invoice) => {
    const existingDraft = reminderDrafts.find((d) => d.invoiceId === invoice.id);
    if (existingDraft) {
      setIsReminderQueueOpen(true);
    } else {
      const newDraft: ReminderDraft = {
        id: `rem-${Date.now()}`,
        invoiceId: invoice.id,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        amount: invoice.amount,
        daysLate: invoice.daysLate || 7,
        tone: "firm",
        subject: `Payment Reminder: ${invoice.invoiceNumber} ($${invoice.amount.toLocaleString()})`,
        message: `Hello ${invoice.clientName},\n\nYour invoice ${invoice.invoiceNumber} is currently overdue. Please settle via the PayPal link below at your earliest convenience.\n\nThank you!`,
        paymentLink: invoice.paymentLink || "https://sandbox.paypal.com/checkout",
        status: "pending_approval",
      };
      setReminderDrafts([newDraft, ...reminderDrafts]);
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
    // remove any pending reminder for this invoice
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
