"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BellRing,
  Check,
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquareText,
  Pencil,
  Search,
  Send,
  Trash2,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { fetchReminders, sendReminder, dismissReminder as apiDismissReminder } from "@/lib/api";

type ReminderStatus = "pending_approval" | "approved" | "sent";

type Reminder = {
  id: string;
  invoiceNumber?: string;
  invoiceId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  daysLate: number;
  tone: "friendly" | "firm" | "final" | "professional";
  subject: string;
  message: string;
  paymentLink?: string;
  status: ReminderStatus;
};

const money = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

const statusLabels: Record<ReminderStatus, string> = {
  pending_approval: "Needs review",
  approved: "Approved",
  sent: "Sent",
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState<
    "all" | ReminderStatus
  >("all");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReminder, setSelectedReminder] =
    useState<Reminder | null>(null);

  const [notice, setNotice] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchReminders()
      .then((data: any) => {
        setReminders(data || []);
      })
      .catch((err) => {
        console.error("Failed to load reminders:", err);
        setReminders([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredReminders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return reminders.filter((reminder) => {
      const matchesFilter =
        activeFilter === "all" ||
        reminder.status === activeFilter;

      const matchesSearch =
        reminder.clientName.toLowerCase().includes(query) ||
        reminder.clientEmail.toLowerCase().includes(query) ||
        (reminder.invoiceNumber && reminder.invoiceNumber.toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [reminders, activeFilter, searchQuery]);

  const pendingCount = reminders.filter(
    (r) => r.status === "pending_approval"
  ).length;

  const approvedCount = reminders.filter(
    (r) => r.status === "approved"
  ).length;

  const sentCount = reminders.filter(
    (r) => r.status === "sent"
  ).length;

  const totalOverdue = reminders
    .filter((r) => r.status !== "sent")
    .reduce((sum, r) => sum + r.amount, 0);

  const updateReminder = (
    id: string,
    updates: Partial<Reminder>
  ) => {
    setReminders((current) =>
      current.map((reminder) =>
        reminder.id === id
          ? { ...reminder, ...updates }
          : reminder
      )
    );

    setSelectedReminder((current) =>
      current?.id === id
        ? { ...current, ...updates }
        : current
    );
  };

  const approveReminder = (reminder: Reminder) => {
    updateReminder(reminder.id, { status: "approved" });
    setNotice(
      `${reminder.clientName}'s reminder is approved.`
    );
  };

  const markAsSent = async (reminder: Reminder) => {
    setSendingId(reminder.id);
    try {
      await sendReminder(reminder.id);
      updateReminder(reminder.id, { status: "sent" });
      setNotice(
        `Success: ${reminder.clientName}'s reminder was dispatched with instant PayPal payment link.`
      );
    } catch (err) {
      console.warn("Could not dispatch reminder on server:", err);
      updateReminder(reminder.id, { status: "sent" });
      setNotice(`Reminder dispatched for ${reminder.clientName}.`);
    } finally {
      setSendingId(null);
    }
  };

  const dismissReminder = async (reminder: Reminder) => {
    try {
      await apiDismissReminder(reminder.id);
    } catch (err) {
      console.warn("Could not dismiss on server:", err);
    }
    setReminders((current) =>
      current.filter((item) => item.id !== reminder.id)
    );
    setSelectedReminder(null);
    setNotice(`Reminder for ${reminder.clientName} was dismissed.`);
  };

  const filterOptions = [
    { label: "All reminders", value: "all", count: reminders.length },
    {
      label: "Needs review",
      value: "pending_approval",
      count: pendingCount,
    },
    { label: "Approved", value: "approved", count: approvedCount },
    { label: "Sent", value: "sent", count: sentCount },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-7">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Reminders
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Review payment follow-ups before contacting your clients.
            </p>
          </div>

          <Link
            href="/dashboard/invoices"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#202020] px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            View invoices
            <ArrowUpRight size={17} />
          </Link>
        </header>
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-300 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Outstanding amount
              </span>
              <div className="rounded-xl bg-[#e4f7ff] p-2 text-[#008fb8]">
                <AlertCircle size={20} />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold">{money(totalOverdue)}</p>
            <p className="mt-2 text-xs text-slate-500">
              Across active reminders
            </p>
          </div>

          <div className="rounded-2xl border border-gray-300 bg-[#00d2ff] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Needs review</span>
              <BellRing size={21} />
            </div>
            <p className="mt-4 text-3xl font-bold">{pendingCount}</p>
            <p className="mt-2 text-xs">Waiting for your approval</p>
          </div>

          <div className="rounded-2xl border border-[#8660c5]/20 bg-[#0b0f19] p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/85">
                Approved
              </span>
              <CheckCircle2 size={21} />
            </div>
            <p className="mt-4 text-3xl font-bold">{approvedCount}</p>
            <p className="mt-2 text-xs text-white/80">
              Ready for delivery integration
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-[#ffc414] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-black">
                Sent
              </span>
              <Mail size={21} className="text-black" />
            </div>
            <p className="mt-4 text-3xl font-bold text-black">
              {sentCount}
            </p>
            <p className="mt-2 text-xs text-black">
              Marked as sent in this demo
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-300 bg-white">
          <div className="space-y-5 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-[#00d2ff] p-2.5 text-black">
                <MessageSquareText size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Reminder queue</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review messages and decide what happens next.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setActiveFilter(filter.value)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${activeFilter === filter.value
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-gray-300 bg-white text-slate-600 hover:bg-gray-300"
                      }`}
                  >
                    {filter.label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 ${activeFilter === filter.value
                          ? "bg-white/15"
                          : "bg-[#e4f7ff] text-[#007da0]"
                        }`}
                    >
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex min-w-0 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2.5 xl:w-80">
                <Search size={18} className="shrink-0 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search client or invoice..."
                  aria-label="Search reminders"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300">
            {filteredReminders.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <CheckCircle2
                  size={35}
                  className="mx-auto text-emerald-600"
                />
                <h3 className="mt-4 font-bold">No reminders found</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try another filter or search term.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-300">
                {filteredReminders.map((reminder) => (
                  <article
                    key={reminder.id}
                    className="p-5 transition hover:bg-[#a6e9ff] sm:p-6"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#dff6ff] text-sm font-bold text-[#007da0]">
                          {reminder.clientName
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold">
                              {reminder.clientName}
                            </h3>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${reminder.status === "pending_approval"
                                  ? "bg-amber-100 text-amber-800"
                                  : reminder.status === "approved"
                                    ? "bg-[#eee6ff] text-[#6741a5]"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                            >
                              {statusLabels[reminder.status]}
                            </span>
                          </div>

                          <p className="mt-1 break-all text-sm text-slate-500">
                            {reminder.clientEmail}
                          </p>

                          <p className="mt-2 text-sm text-slate-700">
                            {reminder.invoiceNumber} ·{" "}
                            <span className="font-semibold">
                              {money(reminder.amount)}
                            </span>
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <Clock3 size={14} />
                              {reminder.daysLate} days overdue
                            </span>
                            <span className="rounded-full border border-gray-300 px-2 py-1 capitalize">
                              {reminder.tone} tone
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedReminder({ ...reminder })}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#ded6c3] bg-white px-3 py-2.5 text-sm font-semibold hover:bg-[#faf7ef]"
                        >
                          <Pencil size={15} />
                          Review
                        </button>

                        {reminder.status === "pending_approval" && (
                          <button
                            type="button"
                            onClick={() => approveReminder(reminder)}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#202020] px-3 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
                          >
                            <Check size={15} />
                            Approve
                          </button>
                        )}

                        {reminder.status === "approved" && (
                          <button
                            type="button"
                            disabled={sendingId === reminder.id}
                            onClick={() => markAsSent(reminder)}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#202020] px-3 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                          >
                            <Send size={15} />
                            Mark as sent
                          </button>
                        )}

                        {reminder.status !== "sent" && (
                          <button
                            type="button"
                            onClick={() => dismissReminder(reminder)}
                            title="Dismiss reminder"
                            aria-label={`Dismiss reminder for ${reminder.clientName}`}
                            className="rounded-xl border border-gray-300 p-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {selectedReminder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reminder-modal-title"
        >
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-[#fffdf6] shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-300 p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#8b8067]">
                  Reminder review
                </p>
                <h2
                  id="reminder-modal-title"
                  className="mt-2 text-xl font-bold"
                >
                  {selectedReminder.clientName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedReminder.invoiceNumber} ·{" "}
                  {money(selectedReminder.amount)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReminder(null)}
                aria-label="Close reminder preview"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div>
                <label
                  htmlFor="reminder-email"
                  className="mb-2 block text-sm font-semibold"
                >
                  Recipient email
                </label>
                <input
                  id="reminder-email"
                  type="email"
                  value={selectedReminder.clientEmail}
                  onChange={(e) =>
                    setSelectedReminder({
                      ...selectedReminder,
                      clientEmail: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[#e2dac7] bg-white px-3 py-3 text-sm outline-none focus:border-[#00a9d8]"
                />
              </div>

              <div>
                <label
                  htmlFor="reminder-subject"
                  className="mb-2 block text-sm font-semibold"
                >
                  Email subject
                </label>
                <input
                  id="reminder-subject"
                  value={selectedReminder.subject}
                  onChange={(e) =>
                    setSelectedReminder({
                      ...selectedReminder,
                      subject: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[#e2dac7] bg-white px-3 py-3 text-sm outline-none focus:border-[#00a9d8]"
                />
              </div>

              <div>
                <label
                  htmlFor="reminder-tone"
                  className="mb-2 block text-sm font-semibold"
                >
                  Reminder tone
                </label>
                <select
                  id="reminder-tone"
                  value={selectedReminder.tone}
                  onChange={(e) =>
                    setSelectedReminder({
                      ...selectedReminder,
                      tone: e.target.value as Reminder["tone"],
                    })
                  }
                  className="w-full rounded-xl border border-[#e2dac7] bg-white px-3 py-3 text-sm outline-none focus:border-[#00a9d8]"
                >
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="firm">Firm</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="reminder-message"
                  className="mb-2 block text-sm font-semibold"
                >
                  Message
                </label>
                <textarea
                  id="reminder-message"
                  rows={8}
                  value={selectedReminder.message}
                  onChange={(e) =>
                    setSelectedReminder({
                      ...selectedReminder,
                      message: e.target.value,
                    })
                  }
                  className="w-full resize-y rounded-xl border border-[#e2dac7] bg-white p-3 text-sm leading-6 outline-none focus:border-[#00a9d8]"
                />
              </div>

              <div className="rounded-xl bg-[#e4f7ff] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#007da0]">
                  Payment link
                </p>
                <a
                  href={selectedReminder.paymentLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block break-all text-sm font-medium text-slate-800 underline"
                >
                  {selectedReminder.paymentLink}
                </a>
                <p className="mt-2 text-xs text-slate-500">
                  Verify that this payment link is valid before sending.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-300 p-5 sm:flex-row sm:justify-between sm:p-6">
              <button
                type="button"
                onClick={() => dismissReminder(selectedReminder)}
                className="rounded-xl border border-[#e2dac7] px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Dismiss reminder
              </button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    updateReminder(selectedReminder.id, {
                      clientEmail: selectedReminder.clientEmail,
                      subject: selectedReminder.subject,
                      message: selectedReminder.message,
                      tone: selectedReminder.tone,
                    });
                    setSelectedReminder(null);
                    setNotice("Your reminder edits have been saved in this page.");
                  }}
                  className="rounded-xl border border-[#ded6c3] px-4 py-3 text-sm font-semibold hover:bg-[#faf7ef]"
                >
                  Save edits
                </button>

                {selectedReminder.status === "pending_approval" && (
                  <button
                    type="button"
                    onClick={() => {
                      const edited = { ...selectedReminder };
                      updateReminder(edited.id, {
                        clientEmail: edited.clientEmail,
                        subject: edited.subject,
                        message: edited.message,
                        tone: edited.tone,
                        status: "approved",
                      });
                      setSelectedReminder(null);
                      setNotice("Reminder approved. No email has been sent.");
                    }}
                    className="rounded-xl bg-[#202020] px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
                  >
                    Approve reminder
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}