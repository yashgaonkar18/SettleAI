"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  Clock3,
  AlertCircle,
  FileText,
  Send,
  ExternalLink,
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import type { Invoice, InvoiceStatus } from "./types";
import InvoiceModal from "./InvoiceModal";
import { deleteInvoice } from "@/lib/api";

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading?: boolean;
  onSendReminder: (invoice: Invoice) => void;
  onMarkAsPaid: (invoiceId: string) => void;
  onInvoiceUpdated?: (invoice: Invoice) => void;
  onDeleteInvoice?: (invoiceId: string) => void;
}

export default function InvoiceTable({
  invoices,
  isLoading = false,
  onSendReminder,
  onMarkAsPaid,
  onInvoiceUpdated,
  onDeleteInvoice,
}: InvoiceTableProps) {
  const [activeFilter, setActiveFilter] =
    useState<"all" | InvoiceStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 3-dot dropdown menu state
  const [menuInvoiceId, setMenuInvoiceId] = useState<string | null>(null);
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close 3-dot menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuInvoiceId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const openViewModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setModalMode("view");
    setIsModalOpen(true);
    setMenuInvoiceId(null);
  };

  const openEditModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setModalMode("edit");
    setIsModalOpen(true);
    setMenuInvoiceId(null);
  };

  const handleCopyLink = (invoice: Invoice) => {
    if (!invoice.paymentLink) return;
    navigator.clipboard.writeText(invoice.paymentLink);
    setCopiedInvoiceId(invoice.id);
    setTimeout(() => setCopiedInvoiceId(null), 2000);
    setMenuInvoiceId(null);
  };

  const handleDelete = async (invoice: Invoice) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete invoice ${invoice.invoiceNumber} for ${invoice.clientName}?`
    );
    if (!confirmed) return;

    setMenuInvoiceId(null);
    try {
      await deleteInvoice(invoice.id);
      if (onDeleteInvoice) {
        onDeleteInvoice(invoice.id);
      }
    } catch (err) {
      console.error("Failed to delete invoice:", err);
      window.alert("Failed to delete invoice. Please try again.");
    }
  };

  const handleModalInvoiceUpdated = (updated: Invoice) => {
    setSelectedInvoice(updated);
    if (onInvoiceUpdated) {
      onInvoiceUpdated(updated);
    }
  };

  return (
    <>
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
                Track payments, click any invoice or the 3-dot menu to view & edit details.
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

        <div className="overflow-x-auto min-h-[300px]">
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
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" />
                        <div className="space-y-1.5">
                          <div className="h-4 w-32 rounded bg-slate-200" />
                          <div className="h-3 w-40 rounded bg-slate-100" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-20 rounded bg-slate-200" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-16 rounded bg-slate-200" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-20 rounded bg-slate-200" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-6 w-20 rounded-full bg-slate-200" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="ml-auto h-8 w-16 rounded-lg bg-slate-200" />
                    </td>
                  </tr>
                ))
              ) : filteredInvoices.length === 0 ? (
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
                  const isMenuOpen = menuInvoiceId === invoice.id;

                  return (
                    <tr
                      key={invoice.id}
                      className="group transition hover:bg-[#e4f7ff]/70"
                    >
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => openViewModal(invoice)}
                          className="flex items-center gap-3 text-left focus:outline-none"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#66c3e6] text-xs font-bold text-slate-700 group-hover:bg-[#00d2ff] transition">
                            {invoice.clientName
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                              {invoice.clientName}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {invoice.clientEmail}
                            </p>
                          </div>
                        </button>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => openViewModal(invoice)}
                          className="font-mono text-xs text-slate-600 hover:text-slate-950 font-semibold hover:underline"
                        >
                          {invoice.invoiceNumber}
                        </button>
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
                        <div className="relative flex items-center justify-end gap-2">
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
                            <span className="text-xs font-medium text-emerald-700 mr-1">
                              Settled
                            </span>
                          )}

                          {invoice.status === "draft" && (
                            <span className="text-xs text-slate-400 mr-1">
                              Draft
                            </span>
                          )}

                          {/* 3 DOTS ACTION BUTTON */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuInvoiceId(isMenuOpen ? null : invoice.id);
                              }}
                              aria-label={`More actions for ${invoice.invoiceNumber}`}
                              title="More actions"
                              className={`rounded-lg p-2 transition ${
                                isMenuOpen
                                  ? "bg-slate-900 text-white"
                                  : "text-slate-500 hover:bg-[#d5effc] hover:text-slate-900"
                              }`}
                            >
                              <MoreHorizontal size={17} />
                            </button>

                            {/* 3 DOTS DROPDOWN POPOVER MENU */}
                            {isMenuOpen && (
                              <div
                                ref={menuRef}
                                className="absolute right-0 top-full z-40 mt-1 w-52 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl transition-all"
                              >
                                <div className="px-3 py-1.5 border-b border-slate-100">
                                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                    Invoice Actions
                                  </p>
                                  <p className="text-xs font-bold text-slate-800 truncate">
                                    {invoice.invoiceNumber}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openViewModal(invoice)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition text-left"
                                >
                                  <Eye size={15} className="text-slate-500" />
                                  View Details
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openEditModal(invoice)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition text-left"
                                >
                                  <Edit3 size={15} className="text-blue-600" />
                                  Edit Invoice
                                </button>

                                {invoice.paymentLink && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopyLink(invoice)}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition text-left"
                                  >
                                    {copiedInvoiceId === invoice.id ? (
                                      <Check size={15} className="text-emerald-600" />
                                    ) : (
                                      <Copy size={15} className="text-slate-500" />
                                    )}
                                    {copiedInvoiceId === invoice.id ? "Link Copied!" : "Copy Payment Link"}
                                  </button>
                                )}

                                {invoice.status !== "paid" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onSendReminder(invoice);
                                        setMenuInvoiceId(null);
                                      }}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition text-left"
                                    >
                                      <Send size={15} className="text-slate-500" />
                                      Send AI Reminder
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        onMarkAsPaid(invoice.id);
                                        setMenuInvoiceId(null);
                                      }}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition text-left"
                                    >
                                      <CheckCircle2 size={15} className="text-emerald-600" />
                                      Mark as Paid
                                    </button>
                                  </>
                                )}

                                <div className="border-t border-slate-100 my-1" />

                                <button
                                  type="button"
                                  onClick={() => handleDelete(invoice)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition text-left"
                                >
                                  <Trash2 size={15} className="text-rose-500" />
                                  Delete Invoice
                                </button>
                              </div>
                            )}
                          </div>
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

      {/* VIEW & EDIT MODAL */}
      <InvoiceModal
        isOpen={isModalOpen}
        invoice={selectedInvoice}
        initialMode={modalMode}
        onClose={() => setIsModalOpen(false)}
        onInvoiceUpdated={handleModalInvoiceUpdated}
        onSendReminder={onSendReminder}
        onMarkAsPaid={onMarkAsPaid}
      />
    </>
  );
}
