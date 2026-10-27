
"use client";

import {
  ArrowUpRight,
  AlertCircle,
  FileText,
} from "lucide-react";

interface CashFlowHeroProps {
  userName: string;
  receivedAmount: number;
  expectedAmount: number;
  atRiskAmount: number;
  receivedInvoices: number;
  expectedInvoices: number;
  atRiskInvoices: number;
  insightText: string;
  isLoading?: boolean;
  onViewInvoices: () => void;
}

const formatCurrency = (amount: number) =>
  `$${amount.toLocaleString("en-US")}`;

export default function CashFlowHero({
  userName,
  receivedAmount,
  expectedAmount,
  atRiskAmount,
  receivedInvoices,
  expectedInvoices,
  atRiskInvoices,
  insightText,
  isLoading = false,
  onViewInvoices,
}: CashFlowHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#00d2ff] p-5 sm:p-7 lg:p-8">
      <div className="pointer-events-none absolute -left-16 -top-40 h-72 w-[115%] rounded-[50%] border-t border-amber-400/80" />

      <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1.4fr] lg:items-center">
        <div className="flex flex-col items-start">
          <p className="mb-5 text-sm font-semibold text-white">
            Hi {userName}!
          </p>

          {isLoading ? (
            <div className="my-2 h-12 w-80 max-w-full rounded-2xl bg-slate-950/20 animate-pulse" />
          ) : (
            <h1 className="max-w-xl text-3xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-4xl xl:text-5xl">
              You’ve been paid{" "}
              {formatCurrency(receivedAmount)} this month
            </h1>
          )}

          {isLoading ? (
            <div className="mt-4 h-5 w-64 max-w-full rounded-lg bg-white/40 animate-pulse" />
          ) : (
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white sm:text-base">
              {insightText}
            </p>
          )}

          <button
            onClick={onViewInvoices}
            className="mt-6 inline-flex items-center gap-5 rounded-lg bg-[#0B0F19] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            View invoices
            <ArrowUpRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative flex min-h-64 flex-col overflow-hidden rounded-xl bg-[#fbf9ef] p-5">
            <span className="text-sm text-slate-500">01</span>

            <h2 className="mt-5 text-base font-semibold text-slate-900">
              Received
            </h2>

            {isLoading ? (
              <>
                <div className="mt-2 h-7 w-28 rounded-lg bg-slate-200 animate-pulse" />
                <div className="mt-2 h-4 w-16 rounded bg-slate-100 animate-pulse" />
              </>
            ) : (
              <>
                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  {formatCurrency(receivedAmount)}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {receivedInvoices} invoices
                </p>
              </>
            )}

            <div className="absolute bottom-0 left-5 right-5 flex h-24 items-end gap-3">
              <div className="h-8 w-9 rounded-t-lg bg-violet-200/70" />
              <div className="h-14 w-9 rounded-t-lg bg-violet-300/60" />
              <div className="h-24 w-9 rounded-t-lg bg-violet-600" />
            </div>
            <div className="absolute -bottom-16 right-0 h-28 w-28 rounded-full border border-slate-800/70" />
          </div>

          <div className="relative flex min-h-64 flex-col overflow-hidden rounded-xl bg-[#ffc414] p-5">
            <span className="text-sm text-slate-900">02</span>

            <h2 className="mt-5 text-base font-semibold text-slate-950">
              Expected
            </h2>

            {isLoading ? (
              <>
                <div className="mt-2 h-7 w-28 rounded-lg bg-slate-900/20 animate-pulse" />
                <div className="mt-2 h-4 w-16 rounded bg-slate-900/10 animate-pulse" />
              </>
            ) : (
              <>
                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  {formatCurrency(expectedAmount)}
                </p>

                <p className="mt-1 text-sm text-slate-800/80">
                  {expectedInvoices} invoices
                </p>
              </>
            )}

            <div className="absolute -bottom-16 -right-5 h-40 w-40 rounded-full border border-slate-900/80">
              <div className="absolute inset-x-7 inset-y-0 rounded-[50%] border border-slate-900/80" />
              <div className="absolute inset-x-0 inset-y-7 rounded-[50%] border border-slate-900/80" />
              <div className="absolute inset-x-0 top-1/2 border-t border-slate-900/80" />
              <div className="absolute inset-y-0 left-1/2 border-l border-slate-900/80" />
            </div>
          </div>

          <div className="relative flex min-h-64 flex-col overflow-hidden rounded-xl bg-[#0B0F19] p-5 text-white">
            <span className="text-sm text-white/80">03</span>

            <h2 className="mt-5 text-base font-semibold">
              At risk
            </h2>

            {isLoading ? (
              <>
                <div className="mt-2 h-7 w-28 rounded-lg bg-white/20 animate-pulse" />
                <div className="mt-2 h-4 w-16 rounded bg-white/10 animate-pulse" />
              </>
            ) : (
              <>
                <p className="mt-1 text-2xl font-bold tracking-tight">
                  {formatCurrency(atRiskAmount)}
                </p>

                <p className="mt-1 text-sm text-white/80">
                  {atRiskInvoices} invoices
                </p>
              </>
            )}

            <div className="absolute -bottom-5 right-4 rotate-[-8deg]">
              <div className="relative h-24 w-20 rounded-md border-2 border-slate-950 bg-white shadow-sm">
                <div className="m-3 h-1 w-10 bg-violet-300" />
                <div className="mx-3 h-1 w-12 bg-slate-200" />
                <div className="mx-3 mt-2 h-1 w-8 bg-slate-200" />
              </div>

              <div className="absolute -left-5 top-5 h-24 w-20 rounded-md border-2 border-slate-950 bg-white" />
            </div>

            <div className="absolute bottom-16 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-xl font-bold text-slate-950 shadow">
              <AlertCircle size={22} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
