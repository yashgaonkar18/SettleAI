"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Edit3,
  CheckCircle2,
  Clock3,
  AlertCircle,
  FileText,
  Send,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Trash2,
  Printer,
  Loader2,
  ArrowRight,
  CreditCard,
} from "lucide-react";
import type { Invoice, InvoiceStatus, LineItem } from "./types";
import { updateInvoice } from "@/lib/api";

interface InvoiceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  initialMode?: "view" | "edit";
  onClose: () => void;
  onInvoiceUpdated?: (updatedInvoice: Invoice) => void;
  onSendReminder?: (invoice: Invoice) => void;
  onMarkAsPaid?: (invoiceId: string) => void;
}

export default function InvoiceModal({
  invoice,
  isOpen,
  initialMode = "view",
  onClose,
  onInvoiceUpdated,
  onSendReminder,
  onMarkAsPaid,
}: InvoiceModalProps) {
  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit form state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<InvoiceStatus>("sent");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  useEffect(() => {
    if (invoice) {
      setMode(initialMode);
      setClientName(invoice.clientName || "");
      setClientEmail(invoice.clientEmail || "");
      setDueDate(invoice.dueDate || "");
      setStatus(invoice.status || "sent");
      setNotes(invoice.notes || "");
      setLineItems(
        invoice.lineItems && invoice.lineItems.length > 0
          ? invoice.lineItems.map((item) => ({
              id: item.id || crypto.randomUUID(),
              description: item.description || "",
              quantity: item.quantity || 1,
              rate: item.rate || 0,
              amount: item.amount || (item.quantity || 1) * (item.rate || 0),
            }))
          : [
              {
                id: crypto.randomUUID(),
                description: "Services Rendered",
                quantity: 1,
                rate: invoice.amount || 0,
                amount: invoice.amount || 0,
              },
            ]
      );
      setErrorMessage("");
      setSaveSuccess(false);
    }
  }, [invoice, initialMode, isOpen]);

  // Total calculation for edit mode
  const calculatedTotal = useMemo(() => {
    return lineItems.reduce(
      (sum, item) => sum + Math.max(0, item.quantity) * Math.max(0, item.rate),
      0
    );
  }, [lineItems]);

  if (!isOpen || !invoice) return null;

  const handleCopyLink = () => {
    if (!invoice.paymentLink) return;
    navigator.clipboard.writeText(invoice.paymentLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: crypto.randomUUID(),
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length <= 1) {
      setErrorMessage("An invoice must contain at least one line item.");
      return;
    }
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (
    index: number,
    field: "description" | "quantity" | "rate",
    val: string | number
  ) => {
    setLineItems((prev) => {
      const copy = [...prev];
      const target = { ...copy[index] };
      if (field === "description") {
        target.description = String(val);
      } else {
        const numVal = Math.max(0, Number(val) || 0);
        target[field] = numVal;
      }
      target.amount = (target.quantity || 0) * (target.rate || 0);
      copy[index] = target;
      return copy;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMessage("Client name is required.");
      return;
    }
    if (!clientEmail.trim()) {
      setErrorMessage("Client email is required.");
      return;
    }
    if (!dueDate) {
      setErrorMessage("Due date is required.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const payload = {
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        dueDate,
        notes,
        status,
        amount: calculatedTotal,
        lineItems: lineItems.map((item) => ({
          description: item.description.trim() || "Item",
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate,
        })),
      };

      const updated = await updateInvoice(invoice.id, payload);
      setSaveSuccess(true);
      if (onInvoiceUpdated) {
        onInvoiceUpdated(updated);
      }
      setTimeout(() => {
        setSaveSuccess(false);
        setMode("view");
      }, 700);
    } catch (err: any) {
      console.error("Failed to update invoice:", err);
      setErrorMessage(err.message || "Failed to update invoice. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (st: InvoiceStatus) => {
    switch (st) {
      case "paid":
        return {
          label: "Paid & Settled",
          icon: CheckCircle2,
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "overdue":
        return {
          label: "Overdue",
          icon: AlertCircle,
          className: "bg-rose-50 text-rose-700 border-rose-200",
        };
      case "sent":
        return {
          label: "Sent / Pending",
          icon: Clock3,
          className: "bg-blue-50 text-blue-700 border-blue-200",
        };
      default:
        return {
          label: "Draft",
          icon: FileText,
          className: "bg-slate-100 text-slate-600 border-slate-200",
        };
    }
  };

  const currentStatusBadge = getStatusBadge(mode === "view" ? invoice.status : status);
  const StatusIcon = currentStatusBadge.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-mono font-bold text-sm">
              #
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {invoice.invoiceNumber}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${currentStatusBadge.className}`}
                >
                  <StatusIcon size={12} />
                  {currentStatusBadge.label}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Created: {new Date(invoice.createdAt || Date.now()).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === "view" ? (
              <button
                type="button"
                onClick={() => setMode("edit")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <Edit3 size={14} />
                Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode("view")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                View Mode
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          {saveSuccess && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 size={16} />
              Invoice updated successfully!
            </div>
          )}

          {mode === "view" ? (
            /* VIEW MODE */
            <div className="space-y-6">
              {/* Client & Date Info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Billed To
                  </span>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {invoice.clientName}
                  </p>
                  <p className="text-xs text-slate-500">{invoice.clientEmail}</p>
                </div>

                <div className="sm:text-right">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Payment Terms
                  </span>
                  <p className="mt-1 text-xs text-slate-700">
                    Due Date: <span className="font-semibold text-slate-900">{invoice.dueDate}</span>
                  </p>
                  {invoice.daysLate && invoice.status === "overdue" ? (
                    <p className="text-xs font-semibold text-rose-600">
                      {invoice.daysLate} days overdue
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Invoice Items
                </h4>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-2.5 font-medium">Description</th>
                        <th className="px-4 py-2.5 text-center font-medium w-20">Qty</th>
                        <th className="px-4 py-2.5 text-right font-medium w-28">Rate</th>
                        <th className="px-4 py-2.5 text-right font-medium w-28">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoice.lineItems && invoice.lineItems.length > 0 ? (
                        invoice.lineItems.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-medium text-slate-800">
                              {item.description}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-600">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-600 font-mono">
                              ${Number(item.rate).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-slate-900 font-mono">
                              ${Number(item.amount || item.quantity * item.rate).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-4 py-3 font-medium text-slate-800">
                            Professional Services
                          </td>
                          <td className="px-4 py-3 text-center text-slate-600">1</td>
                          <td className="px-4 py-3 text-right text-slate-600 font-mono">
                            ${invoice.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-900 font-mono">
                            ${invoice.amount.toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="mt-3 flex justify-end">
                  <div className="w-64 space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-mono font-medium">${invoice.amount.toFixed(2)}</span>
                    </div>
                    {invoice.paidAmount ? (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Paid</span>
                        <span className="font-mono">-${invoice.paidAmount.toFixed(2)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm font-bold text-slate-900">
                      <span>Total Due</span>
                      <span className="font-mono text-base text-slate-950">
                        ${invoice.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs">
                  <span className="font-semibold text-slate-600 block mb-1">
                    Notes & Instructions
                  </span>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* EDIT MODE */
            <form id="edit-invoice-form" onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:outline-none"
                    placeholder="Acme Corp"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Client Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:outline-none"
                    placeholder="billing@acmecorp.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-slate-800 focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent / Pending</option>
                    <option value="paid">Paid & Settled</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              {/* Line Items Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Line Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <Plus size={14} />
                    Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {lineItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs"
                    >
                      <input
                        type="text"
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) =>
                          handleLineItemChange(idx, "description", e.target.value)
                        }
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800"
                      />
                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) =>
                            handleLineItemChange(idx, "quantity", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Rate"
                          value={item.rate}
                          onChange={(e) =>
                            handleLineItemChange(idx, "rate", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-right font-mono text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                        />
                      </div>
                      <div className="w-24 text-right font-mono font-semibold text-slate-900 pr-1">
                        ${((item.quantity || 0) * (item.rate || 0)).toFixed(2)}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        disabled={lineItems.length <= 1}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-end">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 flex items-center gap-3">
                    <span>Calculated Total:</span>
                    <span className="font-mono text-base font-bold text-slate-950">
                      ${calculatedTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes & Terms
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment instructions, bank info, or thank you note..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:outline-none"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 rounded-b-2xl gap-3">
          {mode === "view" ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Printer size={14} />
                  Print / PDF
                </button>

                {invoice.status !== "paid" && onMarkAsPaid && (
                  <button
                    type="button"
                    onClick={() => {
                      onMarkAsPaid(invoice.id);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                  >
                    <CheckCircle2 size={14} />
                    Mark as Paid
                  </button>
                )}

                {invoice.status !== "paid" && onSendReminder && (
                  <button
                    type="button"
                    onClick={() => {
                      onSendReminder(invoice);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
                  >
                    <Send size={13} />
                    Send AI Reminder
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setMode("view")}
                disabled={isSaving}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  form="edit-invoice-form"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
