"use client";

import { useState } from "react";

interface StepItem {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: StepItem[] = [
  {
    number: "01",
    title: "Paste a message",
    description: "Drop in a client email or a one-line job description. SettleAI turns it into a complete payment request with custom PayPal invoice.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Client pays with PayPal",
    description: "You approve it and a real PayPal invoice goes out with a payment link.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 9V5h4M19 9V5h-4M5 15v4h4M19 15v4h-4" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "AI follows up",
    description: "If it goes overdue, the AI drafts a reminder in the right tone for you to approve",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  }
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState<number>(0);

  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-24 text-center">
      <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1E1B3A]">
        How We Work
      </h2>
      <p className="mt-4 text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
        A proven process designed to transform complex workflows into scalable AI-powered systems — efficiently and strategically.
      </p>

      <div className="relative max-w-4xl mx-auto mt-16 sm:mt-20">
        <div className="absolute left-1/2 top-10 bottom-12 -translate-x-1/2 w-[1.5px] bg-slate-200 -z-0 pointer-events-none" />

        <div
          className="absolute left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-[#60a5fa] via-[#c084fc] to-transparent pointer-events-none transition-all duration-500"
          style={{
            top: `${activeStep * 110 + 44}px`,
            height: "70px",
          }}
        />

        <div className="flex flex-col gap-4 sm:gap-6 relative z-10">
          {steps.map((step, idx) => {
            const isOdd = idx % 2 === 0; // 0, 2, 4 -> Step 1, 3, 5
            const isActive = activeStep === idx;

            return (
              <div
                key={step.number}
                onClick={() => setActiveStep(idx)}
                className={`cursor-pointer transition-all duration-300 rounded-[32px] sm:rounded-[44px] p-4 sm:p-7 relative ${
                  isActive
                    ? "bg-[#F3F4F6] shadow-xs"
                    : "hover:bg-slate-50/60"
                }`}
              >
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
                  <div className="flex items-center justify-end">
                    {isOdd ? (
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            isActive
                              ? "bg-[#25252A] text-white shadow-md shadow-slate-900/10"
                              : "bg-[#F0F2F5] text-slate-700 hover:bg-slate-200/70"
                          }`}
                        >
                          {step.icon}
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 text-[11px] font-mono font-bold text-slate-700 shadow-xs">
                          {step.number}
                        </span>
                      </div>
                    ) : (
                      <div className="text-right max-w-xs ml-auto pr-1">
                        <h3 className="text-base sm:text-lg font-bold text-[#1E1B3A]">
                          {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-snug">
                          {step.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center relative z-20">
                    {isActive ? (
                      <div className="relative flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-purple-400 to-pink-400 shadow-sm flex items-center justify-center">
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center transition-transform hover:scale-110">
                        <div className="w-2 h-2 rounded-full bg-slate-200" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-start">
                    {isOdd ? (
                      <div className="text-left max-w-xs pl-1">
                        <h3 className="text-base sm:text-lg font-bold text-[#1E1B3A]">
                          {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-snug">
                          {step.description}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 text-[11px] font-mono font-bold text-slate-700 shadow-xs">
                          {step.number}
                        </span>
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            isActive
                              ? "bg-[#25252A] text-white shadow-md shadow-slate-900/10"
                              : "bg-[#F0F2F5] text-slate-700 hover:bg-slate-200/70"
                          }`}
                        >
                          {step.icon}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
