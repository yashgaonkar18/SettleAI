"use client";

import Link from "next/link";
import Image from "next/image";

export default function CtaBanner() {
  return (
    <section className="max-w-7xl mx-auto px-6 mt-40">
      <div className="relative rounded-[40px] bg-gradient-to-r from-[#00d2ff] via-[#00aaff] to-[#0070ba] p-10 md:p-16 pb-0 md:pb-0 text-white overflow-hidden shadow-2xl flex flex-col items-center">
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl text-left space-y-4">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Ready to get started?
            </h2>
            <p className="text-sm text-white/90">
              Built for the PayPal AI Hackathon with Gemini AI and PayPal Sandbox Orders v2.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Image src="/doodle.svg" alt="arrow" width={100} height={100} className="-mt-5 hidden sm:block" />
            <Link
              href="/dashboard"
              className="inline-block bg-white text-slate-950 hover:bg-slate-100 px-8 py-3.5 rounded-full font-bold text-sm shadow-xl transition transform hover:-translate-y-0.5"
            >
              Try It Out
            </Link>
          </div>
        </div>
        <div className="mt-15 -mb-6 sm:mb-1 md:-mb-7 select-none pointer-events-none">
          <h1 className="text-6xl sm:text-8xl md:text-[10rem] lg:text-[12rem] font-black leading-none tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white/90 to-white/20 whitespace-nowrap">
            SettleAI<span className="bg-clip-text text-transparent bg-gradient-to-b from-white/90 to-white/20">.</span>
          </h1>
        </div>
      </div>
    </section>
  );
}
