"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="max-w-6xl mx-auto px-6 pt-12 border-t border-slate-200">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-12">
        <div>
          <Link href="/" className="text-2xl font-black text-slate-900 flex items-center gap-1">
            <span>SettleAI</span>
            <span className="text-[#00c2ff] text-3xl leading-none">.</span>
          </Link>
          <p className="text-xs text-slate-400 mt-1">
            Get paid faster. Let AI chase the invoices.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="https://x.com/iamyashjr18"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter / X"
              className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center hover:text-slate-950 hover:border-slate-300 hover:bg-slate-100 transition transform "
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            <a
              href="https://www.youtube.com/@yashrangergaming"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition transform "
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            <a
              href="https://www.linkedin.com/in/yash-gaonkar-652003253"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center hover:text-[#0077b5] hover:border-blue-200 hover:bg-blue-50/50 transition transform "
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="pt-6 pb-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <span>Copyright © 2026 SettleAI. Built for PayPal AI Hackathon.</span>
        <span>Open Source under MIT License</span>
      </div>
    </footer>
  );
}
