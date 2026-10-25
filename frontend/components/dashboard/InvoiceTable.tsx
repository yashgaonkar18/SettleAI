
"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle2,
  Clock3,
  AlertCircle,
  FileText,
  Send,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react";
import type { Invoice, InvoiceStatus } from "./types";

interface InvoiceTableProps {
  invoices: Invoice[];
  onSendReminder: (invoice: Invoice) => void;
  onMarkAsPaid: (invoiceId: string) => void;
}

export default function InvoiceTable({
  invoices,
  onSendReminder,
  onMarkAsPaid,
}: InvoiceTableProps) {
  const [activeFilter, setActiveFilter] =
    useState<"all" | InvoiceStatus>("all");

  const [searchQuery, setSearchQuery] = useState("");

  const filters: ("all" | InvoiceStatus)[] = [
    "all",
    "overdue",
    "sent",
    "paid",
    "draft",
  ];

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesFilter =
      activeFilter === "all" || invoice.status === activeFilter;

    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      invoice.clientName.toLowerCase().includes(query) ||
      invoice.invoiceNumber.toLowerCase().includes(query) ||
      invoice.clientEmail.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const getCount = (status: "all" | InvoiceStatus) =>
    status === "all"
      ? invoices.length
      : invoices.filter((invoice) => invoice.status === status).length;

  const getStatus = (status: InvoiceStatus, daysLate?: number) => {
    switch (status) {
      case "paid":
        return {
          label: "Paid",
          icon: CheckCircle2,
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
          iconClass: "text-emerald-500",
        };

      case "overdue":
        return {
          label: daysLate ? `${daysLate} days late` : "Overdue",
          icon: AlertCircle,
          className: "bg-rose-50 text-rose-700 border-rose-200",
          iconClass: "text-rose-500",
        };

      case "sent":
        return {
          label: "Sent",
          icon: Clock3,
          className: "bg-blue-50 text-blue-700 border-blue-200",
          iconClass: "text-blue-500",
        };

      default:
        return {
          label: "Draft",
          icon: FileText,
          className: "bg-slate-100 text-slate-600 border-slate-200",
          iconClass: "text-slate-400",
        };
    }
  };

  return (
    <section
      id="invoice-list"
      className="overflow-hidden rounded-2xl border border-gray-300 bg-[#F3F4F6]"
    >
      <div className="flex flex-col gap-4 border-b border-gray-300 p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950">
              Your invoices
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track payments and manage outstanding invoices.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition ${
                activeFilter === filter
                  ? "border-gray-300 bg-slate-900 text-white"
                  : "border-gray-300 bg-white text-slate-600 hover:bg-gray-300"
              }`}
            >
              {filter === "all" ? "All invoices" : filter}

              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  activeFilter === filter
                    ? "bg-white/15 text-white"
                    : "bg-[#a6e9ff] text-slate-600"
                }`}
              >
                {getCount(filter)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left">
          <thead>
            <tr className="border-b border-gray-300 text-xs text-slate-500">
              <th className="px-5 py-4 font-medium">Client</th>
              <th className="px-4 py-4 font-medium">Invoice</th>
              <th className="px-4 py-4 font-medium">Amount</th>
              <th className="px-4 py-4 font-medium">Due date</th>
              <th className="px-4 py-4 font-medium">Status</th>
              <th className="px-5 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-300">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  No invoices found.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => {
                const status = getStatus(
                  invoice.status,
                  invoice.daysLate
                );

                const StatusIcon = status.icon;

                return (
                  <tr
                    key={invoice.id}
                    className="transition hover:bg-[#a6e9ff]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#66c3e6] text-xs font-bold text-slate-700">
                          {invoice.clientName
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {invoice.clientName}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {invoice.clientEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-mono text-xs text-slate-600">
                        {invoice.invoiceNumber}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="whitespace-nowrap text-sm font-bold text-slate-950">
                        $
                        {invoice.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">
                      {invoice.dueDate}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[11px] font-semibold ${status.className}`}
                      >
                        <StatusIcon
                          size={13}
                          className={status.iconClass}
                        />

                        {status.label}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.status === "overdue" && (
                          <button
                            onClick={() => onSendReminder(invoice)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#252525] px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                          >
                            <Send size={13} />
                            Remind
                          </button>
                        )}

                        {invoice.status === "sent" && (
                          <>
                            <button
                              onClick={() => onMarkAsPaid(invoice.id)}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                            >
                              Mark paid
                            </button>

                            {invoice.paymentLink && (
                              <a
                                href={invoice.paymentLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Open payment link for ${invoice.invoiceNumber}`}
                                className="rounded-lg border border-[#e8e2d1] bg-white p-2 text-slate-600 hover:bg-[#f4f0e3]"
                              >
                                <ExternalLink size={15} />
                              </a>
                            )}
                          </>
                        )}

                        {invoice.status === "paid" && (
                          <span className="text-xs font-medium text-emerald-700">
                            Settled
                          </span>
                        )}

                        {invoice.status === "draft" && (
                          <span className="text-xs text-slate-400">
                            Draft invoice
                          </span>
                        )}

                        <button
                          type="button"
                          aria-label={`More actions for ${invoice.invoiceNumber}`}
                          title="More actions"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-[#eee8d8] hover:text-slate-700"
                        >
                          <MoreHorizontal size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-300 px-5 py-3 text-xs text-slate-500">
        <span>
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </span>

        <span>SettleAI</span>
      </div>
    </section>
  );
}
