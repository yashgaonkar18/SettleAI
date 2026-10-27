
"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpRight,
  CircleCheck,
  Clock3,
  AlertCircle,
  Plus,
  Search,
  Wallet,
  Loader2,
} from "lucide-react";

import InvoiceTable from "@/components/dashboard/InvoiceTable";
import type { Invoice } from "@/components/dashboard/types";
import { fetchInvoices, updateInvoiceStatus, generateReminderDraft } from "@/lib/api";

const money = (amount: number) =>
  `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsLoading(true);
    fetchInvoices()
      .then((data) => setInvoices(data || []))
      .catch((err) => {
        console.error("Failed to load invoices:", err);
        setInvoices([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredInvoices = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return invoices.filter(
      (invoice) =>
        invoice.clientName.toLowerCase().includes(query) ||
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.clientEmail.toLowerCase().includes(query)
    );
  }, [invoices, searchQuery]);

  const receivedAmount = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const expectedAmount = invoices
    .filter((invoice) => invoice.status === "sent")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const overdueInvoices = invoices.filter(
    (invoice) => invoice.status === "overdue"
  );

  const overdueAmount = overdueInvoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0
  );

  const handleMarkAsPaid = async (invoiceId: string) => {
    setInvoices((current) =>
      current.map((invoice) =>
        invoice.id === invoiceId
          ? { ...invoice, status: "paid" }
          : invoice
      )
    );
    try {
      await updateInvoiceStatus(invoiceId, "paid");
    } catch (err) {
      console.warn("Could not update status on server:", err);
    }
  };

  const handleInvoiceUpdated = (updated: Invoice) => {
    setInvoices((current) =>
      current.map((inv) => (inv.id === updated.id ? updated : inv))
    );
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices((current) => current.filter((inv) => inv.id !== invoiceId));
  };

  const handleSendReminder = async (invoice: Invoice) => {
    try {
      await generateReminderDraft(invoice.id);
      window.alert(`AI Reminder draft generated for ${invoice.clientName}! Check Reminders tab.`);
    } catch (err) {
      console.warn("Could not generate reminder draft:", err);
    }
  };

  const handleExport = () => {
    const headers = [
      "Invoice Number",
      "Client",
      "Email",
      "Amount",
      "Due Date",
      "Status",
    ];

    const rows = filteredInvoices.map((invoice) => [
      invoice.invoiceNumber,
      invoice.clientName,
      invoice.clientEmail,
      invoice.amount.toString(),
      invoice.dueDate,
      invoice.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${value.replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "settleai-invoices.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Page heading */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Invoices
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage invoices, track payments, and follow up with clients.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/new-invoice"
              className="inline-flex items-center gap-2 rounded-xl bg-[#202020] px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <Plus size={17} />
              New invoice
            </Link>
          </div>
        </header>

        <div className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3">
          <Search size={19} className="text-slate-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search invoices, clients, or email..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            aria-label="Search invoices"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              Clear
            </button>
          )}
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-gray-300 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Total received
              </span>

              <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                <CircleCheck size={20} />
              </div>
            </div>

            {isLoading ? (
              <>
                <div className="mt-4 h-9 w-32 rounded-lg bg-slate-200 animate-pulse" />
                <div className="mt-2 h-4 w-24 rounded bg-slate-100 animate-pulse" />
              </>
            ) : (
              <>
                <p className="mt-4 text-3xl font-bold tracking-tight">
                  {money(receivedAmount)}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {invoices.filter((i) => i.status === "paid").length} paid invoices
                </p>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-[#00d2ff]  bg-[#00d2ff] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-800">
                Expected payments
              </span>

              <div className="rounded-xl bg-white/50 p-2 text-slate-800">
                <Clock3 size={20} />
              </div>
            </div>

            {isLoading ? (
              <>
                <div className="mt-4 h-9 w-32 rounded-lg bg-slate-900/20 animate-pulse" />
                <div className="mt-2 h-4 w-28 rounded bg-slate-900/10 animate-pulse" />
              </>
            ) : (
              <>
                <p className="mt-4 text-3xl font-bold tracking-tight">
                  {money(expectedAmount)}
                </p>

                <p className="mt-2 text-xs text-slate-700">
                  {invoices.filter((i) => i.status === "sent").length} awaiting payment
                </p>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-[#0B0F19]/20 bg-[#0B0F19] p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/85">
                At risk
              </span>

              <div className="rounded-xl bg-white/15 p-2">
                <AlertCircle size={20} />
              </div>
            </div>

            {isLoading ? (
              <>
                <div className="mt-4 h-9 w-32 rounded-lg bg-white/20 animate-pulse" />
                <div className="mt-2 h-4 w-28 rounded bg-white/10 animate-pulse" />
              </>
            ) : (
              <>
                <p className="mt-4 text-3xl font-bold tracking-tight">
                  {money(overdueAmount)}
                </p>

                <p className="mt-2 text-xs text-white/80">
                  {overdueInvoices.length} overdue invoices
                </p>
              </>
            )}
          </div>
        </section>

        <InvoiceTable
          invoices={filteredInvoices}
          isLoading={isLoading}
          onSendReminder={handleSendReminder}
          onMarkAsPaid={handleMarkAsPaid}
          onInvoiceUpdated={handleInvoiceUpdated}
          onDeleteInvoice={handleDeleteInvoice}
        />

        <div className="flex flex-col justify-between gap-2 rounded-2xl border border-gray-300 bg-white p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#00d2ff] p-2">
              <Wallet size={19} />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Keep your cash flow healthy
              </p>

              <p className="text-xs text-slate-500">
                Review overdue invoices and follow up with clients.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/reminders"
            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-800 hover:underline"
          >
            View reminders
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}
