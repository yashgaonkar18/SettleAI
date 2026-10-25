"use client";

import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="px-4 sm:px-6 pt-6 max-w-7xl mx-auto">
      <div className="relative isolate overflow-hidden rounded-3xl text-center min-h-[600px] sm:min-h-[680px]">
        <div className="absolute inset-0 -z-10">
          <Image src="/bg.png" alt="" fill priority className="object-cover object-bottom" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-16 sm:pt-20">

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#1E1B3A] leading-[1.1]">
            Get paid faster.
            <span className="block text-[#1E1B3A]/50 mt-1">
              Let AI chase the invoices.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#1E1B3A]/70 max-w-xl mx-auto leading-relaxed">
            Turn a plain message into a PayPal invoice, track who has paid, and
            let an AI agent write the follow-ups you never want to write.
          </p>

          <div className="mt-8">
            <Link
              href="/dashboard"
              className="inline-block bg-[#0f172b] text-white px-7 py-3 rounded-full font-medium text-sm shadow-lg hover:bg-[#334155] transition-colors"
            >
              Try it now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}