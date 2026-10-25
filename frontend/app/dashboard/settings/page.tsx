"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Building2,
  Check,
  ChevronRight,
  CircleUserRound,
  CreditCard,
  Save,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

type Settings = {
  fullName: string;
  email: string;
  businessName: string;
  currency: string;
  paymentTerms: string;
  reminderTone: string;
  firstReminder: string;
  repeatReminder: string;
  emailNotifications: boolean;
  overdueAlerts: boolean;
  paymentNotifications: boolean;
  weeklySummary: boolean;
  theme: "light" | "dark";
};

const defaultSettings: Settings = {
  fullName: "Yash",
  email: "",
  businessName: "My Business",
  currency: "USD",
  paymentTerms: "net-30",
  reminderTone: "friendly",
  firstReminder: "1",
  repeatReminder: "7",
  emailNotifications: true,
  overdueAlerts: true,
  paymentNotifications: true,
  weeklySummary: false,
  theme: "light",
};

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#00a9d8] focus:ring-2 focus:ring-[#00a9d8]/10";

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="rounded-xl bg-[#e4f7ff] p-2.5 text-[#008fb8]">
        {icon}
      </div>
      <div>
        <h2 className="font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function SettingToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-[#00a9d8]" : "bg-slate-300"
          }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${checked ? "left-6" : "left-1"
            }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("settleai-settings");

      if (stored) {
        const parsed = JSON.parse(stored);

        setSettings({
          ...defaultSettings,
          ...parsed,
        });
      }
    } catch {
    } finally {
      setLoaded(true);
    }
  }, []);

  const update = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const saveSettings = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      localStorage.setItem("settleai-settings", JSON.stringify(settings));
      setSaved(true);
    } catch {
      setSaved(false);
      window.alert(
        "Settings could not be saved. Please check your browser storage."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <form
        onSubmit={saveSettings}
        className="mx-auto w-full max-w-5xl space-y-7"
      >
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Settings
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Manage your business profile and invoice preferences.
            </p>
          </div>

          <button
            type="submit"
            disabled={!loaded}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b0f19] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {saved ? <Check size={17} /> : <Save size={17} />}
            {saved ? "Changes saved" : "Save changes"}
          </button>
        </header>

        {saved && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
          >
            <Check size={18} />
            Your settings have been saved in this browser.
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-gray-300 bg-white p-3 lg:sticky lg:top-6">
            <p className="px-3 pb-3 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Preferences
            </p>

            {[
              { label: "Profile", icon: CircleUserRound, id: "profile" },
              { label: "Business", icon: Building2, id: "business" },
              { label: "Notifications", icon: Bell, id: "notifications" },
              { label: "Reminders", icon: SlidersHorizontal, id: "reminders" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-[#e4f7ff] hover:text-slate-950"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} />
                    {item.label}
                  </span>
                  <ChevronRight size={15} className="text-slate-400" />
                </a>
              );
            })}

            <div className="mt-4 rounded-xl bg-[#e4f7ff] p-3">
              <ShieldCheck size={21} className="text-[#008fb8]" />
              <p className="mt-2 text-sm font-bold">Your workspace</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Keep your business details and reminder preferences up to date.
              </p>
            </div>
          </aside>

          <div className="min-w-0 space-y-6">
            <section
              id="profile"
              className="scroll-mt-6 rounded-2xl border border-gray-300 bg-white p-5 sm:p-6"
            >
              <SectionHeading
                icon={<CircleUserRound size={21} />}
                title="Personal profile"
                description="Your name and email address."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Full name
                  </label>
                  <input
                    id="fullName"
                    value={settings.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    placeholder="Your name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@company.com"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <section
              id="business"
              className="scroll-mt-6 rounded-2xl border border-gray-300 bg-white p-5 sm:p-6"
            >
              <SectionHeading
                icon={<Building2 size={21} />}
                title="Business & invoicing"
                description="Set the default details used when creating invoices."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="businessName"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Business name
                  </label>
                  <input
                    id="businessName"
                    value={settings.businessName}
                    onChange={(e) => update("businessName", e.target.value)}
                    placeholder="Your business name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="currency"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Default currency
                  </label>
                  <select
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => update("currency", e.target.value)}
                    className={inputClass}
                  >
                    <option value="USD">USD — US Dollar</option>
                    <option value="INR">INR — Indian Rupee</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                    <option value="AUD">AUD — Australian Dollar</option>
                    <option value="CAD">CAD — Canadian Dollar</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="paymentTerms"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Default payment terms
                  </label>
                  <select
                    id="paymentTerms"
                    value={settings.paymentTerms}
                    onChange={(e) => update("paymentTerms", e.target.value)}
                    className={inputClass}
                  >
                    <option value="due-on-receipt">Due on receipt</option>
                    <option value="net-7">Net 7 days</option>
                    <option value="net-14">Net 14 days</option>
                    <option value="net-30">Net 30 days</option>
                    <option value="net-60">Net 60 days</option>
                  </select>
                  <p className="mt-2 text-xs text-slate-500">
                    This preference is saved here. Connect it to your invoice
                    form to apply it automatically.
                  </p>
                </div>
              </div>
            </section>

            <section
              id="notifications"
              className="scroll-mt-6 rounded-2xl border border-gray-300 bg-white p-5 sm:p-6"
            >
              <SectionHeading
                icon={<Bell size={21} />}
                title="Notifications"
                description="Choose which updates you want to receive."
              />

              <div className="divide-y divide-[#eee6d6]">
                <SettingToggle
                  title="Email notifications"
                  description="Receive account and invoice updates by email."
                  checked={settings.emailNotifications}
                  onChange={(v) => update("emailNotifications", v)}
                />
                <SettingToggle
                  title="Overdue payment alerts"
                  description="Get notified when an invoice passes its due date."
                  checked={settings.overdueAlerts}
                  onChange={(v) => update("overdueAlerts", v)}
                />
                <SettingToggle
                  title="Payment confirmations"
                  description="Receive updates when a payment is recorded."
                  checked={settings.paymentNotifications}
                  onChange={(v) => update("paymentNotifications", v)}
                />
                <SettingToggle
                  title="Weekly summary"
                  description="Get a weekly overview of invoices and outstanding payments."
                  checked={settings.weeklySummary}
                  onChange={(v) => update("weeklySummary", v)}
                />
              </div>
            </section>
            <section
              id="reminders"
              className="scroll-mt-6 rounded-2xl border border-gray-300 bg-white p-5 sm:p-6"
            >
              <SectionHeading
                icon={<SlidersHorizontal size={21} />}
                title="Reminder preferences"
                description="Set the default tone and follow-up schedule."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="reminderTone"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Default reminder tone
                  </label>
                  <select
                    id="reminderTone"
                    value={settings.reminderTone}
                    onChange={(e) => update("reminderTone", e.target.value)}
                    className={inputClass}
                  >
                    <option value="friendly">Friendly</option>
                    <option value="professional">Professional</option>
                    <option value="firm">Firm</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="firstReminder"
                    className="mb-2 block text-sm font-semibold"
                  >
                    First reminder
                  </label>
                  <select
                    id="firstReminder"
                    value={settings.firstReminder}
                    onChange={(e) => update("firstReminder", e.target.value)}
                    className={inputClass}
                  >
                    <option value="1">1 day after due date</option>
                    <option value="3">3 days after due date</option>
                    <option value="7">7 days after due date</option>
                    <option value="14">14 days after due date</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="repeatReminder"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Repeat follow-up after
                  </label>
                  <select
                    id="repeatReminder"
                    value={settings.repeatReminder}
                    onChange={(e) => update("repeatReminder", e.target.value)}
                    className={inputClass}
                  >
                    <option value="3">3 days</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                  </select>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    These settings define your preferred schedule only. They
                    will not send automatic reminders until a backend scheduler
                    and email service are connected.
                  </p>
                </div>
              </div>
            </section>
            <div className="flex flex-col-reverse justify-between gap-3 border-t border-[#ded6c3] pt-5 sm:flex-row sm:items-center">
              <p className="text-xs leading-5 text-slate-500">
                Settings are stored in this browser, not synced across devices.
              </p>

              <button
                type="submit"
                disabled={!loaded}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b0f19] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {saved ? <Check size={17} /> : <Save size={17} />}
                {saved ? "Changes saved" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}