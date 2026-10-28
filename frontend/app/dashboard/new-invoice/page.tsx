"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  Check,
  FileText,
  Plus,
  Trash2,
  UserRound,
  WandSparkles,
  PencilLine,
} from "lucide-react";
import { createInvoice, parseInvoicePrompt } from "@/lib/api";

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

type InvoiceStatus = "draft" | "sent";

// The id is passed in for the initial item so the server and client agree on it.
// Event handlers call this with no argument and get a fresh random UUID.
const createLineItem = (id: string = crypto.randomUUID()): LineItem => ({
  id,
  description: "",
  quantity: 1,
  rate: 0,
});

const pad = (n: number) => String(n).padStart(2, "0");

const money = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

// Replace with the signed-in user's business details when you have them.
const BUSINESS = {
  initials: "NS",
  name: "Northstar Studio",
  lines: ["12 Harbour Lane, Dubai", "hello@northstar.studio"],
};

// Fixed bar widths so the barcode is identical on server and client.
const BARS = [
  2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2,
  1, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 2,
];

const formatDate = (d: string) =>
  d
    ? new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

function Leader({
  label,
  value,
  bold,
}: {
  label: ReactNode;
  value: ReactNode;
  bold?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="shrink-0">{label}</span>
      <span className="flex-1 border-b border-dotted border-slate-300" />
      <span className={`shrink-0 ${bold ? "font-bold" : ""}`}>{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="my-5 border-t border-dashed border-slate-300" />;
}

// Receipt-style invoice. Used in the sidebar summary and in the review modal.
function InvoiceReceipt({
  invoiceNumber,
  issueDate,
  dueDate,
  clientName,
  clientEmail,
  lineItems,
  subtotal,
  notes,
}: {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  lineItems: LineItem[];
  subtotal: number;
  notes: string;
}) {
  return (
    <div className="rounded-sm border border-gray-200 bg-white px-6 py-8 font-mono text-[11px] leading-5 text-slate-900 shadow-sm">
      {/* Business header */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0b0f19] text-[11px] font-bold text-white">
          {BUSINESS.initials}
        </div>
        <p className="mt-4 text-sm font-bold uppercase tracking-[0.25em]">
          {BUSINESS.name}
        </p>
        <div className="mt-3 text-[10px] text-slate-500">
          {BUSINESS.lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
      </div>

      <Divider />

      {/* Title + meta */}
      <h3 className="text-center text-xl font-bold uppercase tracking-[0.4em]">
        Invoice
      </h3>
      <div className="mt-5 space-y-1.5">
        <Leader label="No." value={invoiceNumber || "—"} />
        <Leader label="Date" value={formatDate(issueDate)} />
        <Leader label="Due" value={formatDate(dueDate)} />
      </div>

      <Divider />

      {/* Bill to */}
      <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400">
        Bill to
      </p>
      <p className="mt-2 text-xs font-bold">{clientName || "Not added"}</p>
      <p className="mt-1 break-all text-[10px] text-slate-500">
        {clientEmail || "No email"}
      </p>

      <Divider />

      {/* Line items */}
      <div className="space-y-4">
        {lineItems.map((item) => (
          <div key={item.id}>
            <p className="font-bold">{item.description || "Untitled item"}</p>
            <Leader
              label={`${item.quantity} × ${money(item.rate)}`}
              value={money(item.quantity * item.rate)}
            />
          </div>
        ))}
      </div>

      <Divider />

      {/* Totals */}
      <div className="space-y-1.5">
        <Leader
          label={<span className="uppercase">Subtotal</span>}
          value={money(subtotal)}
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between border-y-2 border-[#0b0f19] py-3">
        <span className="text-sm font-bold uppercase">Total</span>
        <span className="text-xl font-bold">{money(subtotal)}</span>
      </div>

      {/* Notes */}
      {notes && (
        <>
          <Divider />
          <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400">
            Notes
          </p>
          <p className="mt-2 whitespace-pre-wrap text-[11px]">{notes}</p>
        </>
      )}

      {/* Barcode */}
      <div
        className="mt-6 flex h-12 items-stretch justify-center gap-[2px]"
        aria-hidden="true"
      >
        {BARS.map((w, i) => (
          <span
            key={i}
            className={i % 2 === 0 ? "bg-[#0b0f19]" : "bg-transparent"}
            style={{ width: w * 1.5 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [prompt, setPrompt] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  // Time-based fields start empty and are filled in the effect below,
  // so nothing time-dependent is evaluated during prerender.
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("Thank you for your business.");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    createLineItem("item-1"),
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const now = new Date();
    setIssueDate(
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    );
    setInvoiceNumber(
      `INV-${now.getFullYear()}-${String(now.getTime()).slice(-4)}`
    );
  }, []);

  const subtotal = useMemo(
    () =>
      lineItems.reduce(
        (total, item) =>
          total + Math.max(0, item.quantity) * Math.max(0, item.rate),
        0
      ),
    [lineItems]
  );

  const updateLineItem = (
    id: string,
    field: keyof Omit<LineItem, "id">,
    value: string
  ) => {
    setLineItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "description"
                  ? value
                  : Math.max(0, Number(value) || 0),
            }
          : item
      )
    );
  };

  const generateDraft = async () => {
    if (!prompt.trim()) {
      setMessage("Paste a client message or project description first.");
      return;
    }

    setIsGenerating(true);
    setMessage("");

    try {
      const parsed = await parseInvoicePrompt(prompt);
      if (parsed.clientName) setClientName(parsed.clientName);
      if (parsed.clientEmail) setClientEmail(parsed.clientEmail);
      if (parsed.dueDate) setDueDate(parsed.dueDate);
      if (parsed.notes) setNotes(parsed.notes);
      if (parsed.lineItems && parsed.lineItems.length > 0) {
        setLineItems(
          parsed.lineItems.map((item) => ({
            id: crypto.randomUUID(),
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
          }))
        );
      }
      setMessage("AI drafted invoice successfully! Review details and save.");
      setMode("manual");
    } catch (err: any) {
      console.warn("Gemini parse failed:", err);
      // Simple fallback heuristic
      const email =
        prompt.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
      const amountMatch = prompt.match(
        /(?:\$|USD\s?)(\d[\d,]*(?:\.\d{1,2})?)/i
      );
      const amount = Number((amountMatch?.[1] ?? "0").replace(/,/g, ""));
      if (email) setClientEmail(email);
      setLineItems([
        {
          id: crypto.randomUUID(),
          description: prompt.trim().slice(0, 100),
          quantity: 1,
          rate: amount,
        },
      ]);
      setMessage("Draft prepared. Please verify fields before saving.");
      setMode("manual");
    } finally {
      setIsGenerating(false);
    }
  };

  const validateInvoice = () => {
    if (!clientName.trim()) {
      setMessage("Please enter the client's name.");
      return false;
    }

    if (
      !clientEmail.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)
    ) {
      setMessage("Please enter a valid client email address.");
      return false;
    }

    if (!dueDate) {
      setMessage("Please choose a due date.");
      return false;
    }

    if (lineItems.some((item) => !item.description.trim() || item.rate <= 0)) {
      setMessage(
        "Add a description and a rate greater than zero to each item."
      );
      return false;
    }

    return true;
  };

  const saveInvoice = async (status: InvoiceStatus) => {
    if (!validateInvoice()) return;

    setIsSaving(true);
    setMessage("");

    try {
      const created = await createInvoice({
        invoiceNumber,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        dueDate,
        notes,
        status,
        amount: subtotal,
        lineItems: lineItems.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          rate: it.rate,
          amount: it.quantity * it.rate,
        })),
      });

      setMessage(
        status === "draft"
          ? `Invoice ${created.invoiceNumber} saved as draft.`
          : `Invoice ${created.invoiceNumber} created and sent via PayPal to ${clientEmail.trim()}!`
      );
      setShowPreview(false);
      setTimeout(() => {
        router.push("/dashboard/invoices");
      }, 1500);
    } catch (err: any) {
      console.error("Failed to save invoice:", err);
      setMessage(
        "Could not save invoice to database: " + (err.message || "Unknown error")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const receiptProps = {
    invoiceNumber,
    issueDate,
    dueDate,
    clientName,
    clientEmail,
    lineItems,
    subtotal,
    notes,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-7">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Create an invoice
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Create invoices manually or start with an AI-assisted draft.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#0b0f19] bg-[#0b0f19] px-3 py-2 text-xs font-medium text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Review before sending
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-300 bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-[#00d2ff] p-2.5 text-white">
                  <WandSparkles size={21} />
                </div>
                <div>
                  <h2 className="font-bold">How would you like to start?</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Choose your invoice creation method.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode("ai")}
                  className={`rounded-xl border p-4 text-left transition ${
                    mode === "ai"
                      ? "border-[#00a9d8] bg-[#e4f9ff]"
                      : "border-gray-300 hover:bg-[#faf7ef]"
                  }`}
                >
                  <Bot size={22} className="mb-3 text-[#00d2ff]" />
                  <p className="font-semibold">AI-assisted</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Start from a client message
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("manual");
                    setMessage("");
                  }}
                  className={`rounded-xl border p-4 text-left transition ${
                    mode === "manual"
                      ? "border-[#00a9d8] bg-[#e4f9ff]"
                      : "border-gray-300 hover:bg-[#faf7ef]"
                  }`}
                >
                  <FileText size={22} className="mb-3 text-[#008fb8]" />
                  <p className="font-semibold">Manual entry</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Fill in every field yourself
                  </p>
                </button>
              </div>

              {mode === "ai" && (
                <div className="mt-5 space-y-3">
                  <label
                    htmlFor="client-message"
                    className="block text-sm font-semibold"
                  >
                    Client message or project description
                  </label>
                  <textarea
                    id="client-message"
                    value={prompt}
                    onChange={(event) => {
                      setPrompt(event.target.value);
                      setMessage("");
                    }}
                    rows={5}
                    placeholder={`Example: Create an invoice for Acme Corp, billing@acme.com. Website development, $2,500. Payment due next month.`}
                    className="w-full resize-y rounded-xl border border-gray-300 bg-white p-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#8660c5] focus:ring-2 focus:ring-[#8660c5]/10"
                  />
                  <button
                    type="button"
                    onClick={generateDraft}
                    disabled={isGenerating}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b0f19] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
                  >
                    <PencilLine size={17} />
                    {isGenerating ? "Preparing..." : "Prepare draft"}
                  </button>
                </div>
              )}
            </section>

            <section className="space-y-5 rounded-2xl border border-gray-300 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#e4f7ff] p-2.5 text-[#008fb8]">
                  <UserRound size={21} />
                </div>
                <div>
                  <h2 className="font-bold">Invoice details</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter your client and payment information.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="client-name" className="text-sm font-medium">
                    Client name *
                  </label>
                  <input
                    id="client-name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#00a9d8]"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="client-email" className="text-sm font-medium">
                    Client email *
                  </label>
                  <input
                    id="client-email"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="billing@company.com"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#00a9d8]"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="invoice-number"
                    className="text-sm font-medium"
                  >
                    Invoice number
                  </label>
                  <input
                    id="invoice-number"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#00a9d8]"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="issue-date" className="text-sm font-medium">
                    Issue date
                  </label>
                  <input
                    id="issue-date"
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#00a9d8]"
                  />
                </div>

                <div className="flex flex-col space-y-2 sm:col-span-2">
                  <label htmlFor="due-date" className="text-sm font-medium">
                    Due date *
                  </label>
                  <input
                    id="due-date"
                    type="date"
                    min={issueDate || undefined}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#00a9d8] sm:max-w-[calc(50%-8px)]"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-300 bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold">Line items</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    List the products or services you are charging for.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setLineItems((items) => [...items, createLineItem()])
                  }
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#0b0f19] px-3 py-2 text-sm font-semibold hover:bg-[#0b0f19] hover:text-white"
                >
                  <Plus size={16} />
                  Add item
                </button>
              </div>

              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-gray-300 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Item {index + 1}
                      </p>
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          aria-label={`Remove item ${index + 1}`}
                          onClick={() =>
                            setLineItems((items) =>
                              items.filter((line) => line.id !== item.id)
                            )
                          }
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_90px_120px]">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-600">
                          Description
                        </label>
                        <input
                          value={item.description}
                          onChange={(e) =>
                            updateLineItem(
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Website development"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00a9d8]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-600">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(item.id, "quantity", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00a9d8]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-600">
                          Rate ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) =>
                            updateLineItem(item.id, "rate", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00a9d8]"
                        />
                      </div>
                    </div>

                    <div className="mt-3 text-right text-sm">
                      <span className="text-slate-500">Item total: </span>
                      <span className="font-bold">
                        {money(item.quantity * item.rate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3 border-t border-gray-300 pt-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold">{money(subtotal)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{money(subtotal)}</span>
                </div>
                <p className="text-xs text-slate-500">
                  Tax and discounts are not included in this version.
                </p>
              </div>
            </section>

            {message && (
              <div
                role="status"
                className="rounded-xl border border-gray-300 bg-[#fffdf6] p-4 text-sm text-slate-700"
              >
                {message}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Link
                href="/dashboard/invoices"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-[#0b0f19] px-5 py-3 text-sm font-semibold text-white hover:bg-white hover:text-black"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (validateInvoice()) {
                    setMessage("");
                    setShowPreview(true);
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b0f19] px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Review invoice
                <ArrowRight size={17} />
              </button>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6">
            <InvoiceReceipt {...receiptProps} />

            <div className="rounded-2xl border border-[#0b0f19] bg-[#0b0f19] p-5">
              <h3 className="font-bold text-white">Before you send</h3>
              <ul className="mt-4 space-y-3 text-sm text-white">
                {[
                  "Verify the client email",
                  "Check every line item",
                  "Confirm the due date",
                  "Review the total amount",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check
                      size={17}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {showPreview && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-title"
        >
          <div className="mx-auto my-6 w-full max-w-md">
            <div className="mb-3 flex items-center justify-between text-white">
              <h2
                id="preview-title"
                className="text-xs font-semibold uppercase tracking-widest"
              >
                Final review
              </h2>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="rounded-lg px-3 py-1 text-2xl leading-none hover:bg-white/10"
                aria-label="Close preview"
              >
                ×
              </button>
            </div>

            <InvoiceReceipt {...receiptProps} />

            <div className="mt-4 rounded-2xl bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => saveInvoice("draft")}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save as draft"}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => saveInvoice("sent")}
                  className="flex-1 rounded-xl bg-[#0b0f19] px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  {isSaving ? "Sending..." : "Approve & Send via PayPal"}
                </button>
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                “Approve & Send” generates a real PayPal invoice and emails it directly to your client with a PayPal checkout link.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}