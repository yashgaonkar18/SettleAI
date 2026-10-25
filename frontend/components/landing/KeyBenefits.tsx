"use client";

import React from "react";
import Image from "next/image";

export default function KeyBenefits() {
  return (
    <section id="key-benefits" className="max-w-7xl mx-auto px-4 sm:px-6 ">
      <div className="text-center mb-14 sm:mb-16">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
          Key benefits
        </h2>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-[32px] p-7 sm:p-8 flex flex-col justify-between border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.08)] transition-all duration-300 min-h-[420px] overflow-hidden group">
            <div className="relative h-44 w-full flex items-center justify-center">
              <div className="absolute w-40 bg-slate-900 text-white rounded-2xl p-4 shadow-xl rotate-[12deg] translate-x-6 -translate-y-2 group-hover:rotate-[16deg] group-hover:translate-x-8 transition-transform duration-300 border border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                    ✓
                  </div>
                  <span className="text-[11px] font-semibold text-slate-300">Parsed</span>
                </div>
                <div className="text-xs text-slate-400">Due in 14 days</div>
                <div className="text-lg font-bold text-white mt-0.5">+£385.00</div>
              </div>

              <div className="absolute w-40 bg-white text-slate-900 rounded-2xl p-4 shadow-2xl rotate-[-8deg] -translate-x-6 translate-y-1 group-hover:rotate-[-12deg] group-hover:-translate-x-8 transition-transform duration-300 border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-[#00c2ff]/15 text-[#00a3d9] flex items-center justify-center text-xs font-bold">
                    <Image src="/star.svg" alt="arrow" width={20} height={20} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Plain English</span>
                </div>
                <div className="text-xs text-slate-400">Client: Acme Studio</div>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">+£120.00</div>
              </div>
            </div>

            <div className="text-center pt-4">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Invoices that write themselves
              </h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                Describe the job in plain English. We pull out the client, amounts, and due date, so you skip the forms.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-7 sm:p-8 flex flex-col justify-between border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.08)] transition-all duration-300 min-h-[420px] overflow-hidden group">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Your invoice, in your client’s inbox in seconds
              </h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                Review the preview, hit Approve, and a real PayPal invoice goes out. No copy-pasting between tools.
              </p>
            </div>

            <div className="relative h-44 w-full flex items-center justify-center mt-4">
              <div className="absolute w-52 h-32 rounded-2xl bg-gradient-to-tr from-[#005ea6] to-[#00c2ff] p-4 text-white shadow-lg rotate-[-10deg] -translate-x-4 group-hover:rotate-[-14deg] group-hover:-translate-x-6 transition-transform duration-300 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/80">PayPal Verified</span>
                  <div className="w-5 h-5 rounded-full bg-white/20" />
                </div>
                <div>
                  <div className="text-[10px] text-white/70">Instant Settlement</div>
                  <div className="text-xs font-mono font-medium tracking-wider">INV-2026-084</div>
                </div>
              </div>

              <div className="absolute w-52 h-32 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 p-4 text-white shadow-2xl rotate-[6deg] translate-x-4 translate-y-3 group-hover:rotate-[8deg] group-hover:translate-x-6 transition-transform duration-300 border border-slate-700/60 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00c2ff]" />
                    Approved
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">VISA</span>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">James Hall • Acme Corp</div>
                  <div className="text-xs font-mono text-slate-300 tracking-wider">•••• 1111 - 1111 - 1111</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-7 sm:p-8 flex flex-col justify-between border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.08)] transition-all duration-300 min-h-[420px] overflow-hidden group">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Awkward follow-ups, handled
              </h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                Late payment? We draft the message so you don’t have to find the right words.
              </p>
            </div>

            <div className="relative w-full flex justify-center items-end mt-4 pt-2">
              <div className="absolute left-6 top-2 z-20 bg-white rounded-2xl p-2.5 shadow-xl border border-slate-100 flex items-center gap-2 group-hover:-translate-y-1 transition-transform duration-300">
                <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                  📅
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-800 leading-none">Auto-Nudge</div>
                  <div className="text-[9px] text-slate-400 leading-tight">Scheduled day 3</div>
                </div>
              </div>

              <div className="w-44 bg-slate-900 rounded-t-[26px] p-1.5 pt-2 border-t-2 border-x-2 border-slate-800 shadow-2xl">
                <div className="bg-white rounded-t-[20px] px-3 pt-3 pb-6 text-center">
                  <div className="w-9 h-9 mx-auto rounded-full bg-cyan-50 text-[#00c2ff] flex items-center justify-center font-bold text-base shadow-sm mb-1.5">
                    ✓
                  </div>
                  <div className="text-xs font-bold text-slate-900">Message Delivered</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">PayPal reminder link attached</div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1 text-left">
                    <div className="flex justify-between text-[8px] text-slate-400">
                      <span>Status</span>
                      <span className="text-emerald-600 font-semibold">Opened</span>
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-400">
                      <span>Payment</span>
                      <span className="text-slate-700 font-medium">$1,250.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-[32px] p-8 sm:p-9 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between overflow-hidden group">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                The right tone, every time
              </h3>
              <p className="mt-2.5 text-sm sm:text-base text-slate-500 leading-relaxed max-w-sm">
                A gentle nudge at day 2. A firm reminder at day 10. Always professional, never rude.
              </p>
            </div>

            <div className="relative mt-8 flex items-center justify-end">
              <div className="absolute left-2 -top-4 z-20 bg-slate-900 text-white rounded-2xl px-3.5 py-2 shadow-xl border border-slate-800 rotate-[-6deg] group-hover:rotate-[-8deg] transition-transform duration-300 flex items-center gap-2">
                <span className="text-xs">💬</span>
                <span className="text-xs font-bold">Smart Escalation</span>
              </div>

              <div className="w-full max-w-xs bg-slate-50/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/70 shadow-lg space-y-2.5">
                <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="font-semibold text-slate-700 text-[11px]">Day 2: Gentle Nudge</span>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md">Friendly</span>
                </div>

                <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="font-semibold text-slate-700 text-[11px]">Day 5: Polite Follow-up</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">Neutral</span>
                </div>

                <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="font-semibold text-slate-700 text-[11px]">Day 10: Firm Reminder</span>
                  </div>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">Direct</span>
                </div>
              </div>

              <div className="absolute -right-2 -bottom-2 bg-[#00c2ff] text-white w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm shadow-md rotate-12">
                $
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#0B0F19] text-white rounded-[32px] p-8 sm:p-9 border border-slate-800 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,194,255,0.1)] transition-all duration-300 flex flex-col justify-between overflow-hidden group">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                One-click chasing
              </h3>
              <p className="mt-2.5 text-sm sm:text-base text-slate-400 leading-relaxed max-w-lg">
                Every reminder comes with the PayPal payment link built in, so clients can pay the moment they read it.
              </p>
            </div>

            <div className="relative mt-6 pt-4">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#00c2ff]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="transform md:rotate-[-2deg] md:hover:rotate-0 transition-transform duration-500 ease-out">
                <div className="bg-slate-900/90 rounded-2xl border border-slate-700/80 p-4 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold tracking-wider text-cyan-400">PAYPAL FAST-PAY</span>
                      <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                        Live Sandbox
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    </div>
                  </div>

                  <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00c2ff] to-[#005ea6] flex items-center justify-center font-bold text-white text-sm shadow-md">
                        P
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Invoice #INV-9284</div>
                        <div className="text-[11px] text-slate-400">Design Sprint • Horizon Labs</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-white">$2,850.00</span>
                      <button className="bg-[#ffc439] hover:bg-[#f6b720] text-slate-900 px-4 py-1.5 rounded-full text-xs font-extrabold tracking-tight transition-colors shadow-md">
                        Pay with PayPal
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 text-[11px] text-slate-400 flex items-center justify-between px-1">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      Direct checkout link pre-generated
                    </span>
                    <span className="font-mono text-cyan-400">0 friction to pay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
