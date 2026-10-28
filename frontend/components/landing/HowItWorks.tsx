"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* ------------------------------------------------------------------ */
/*  Mini previews shown next to each step                              */
/* ------------------------------------------------------------------ */

function MessagePreview() {
  return (
    <div className="space-y-3 text-left">
      <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-[13px] leading-snug text-slate-700">
        Hey! Can you design a logo for our café? Budget is around $1,200 and
        we need it by Friday.
      </div>

      <div className="flex items-center gap-2 pl-1 text-[11px] font-medium text-slate-400">
        <span className="h-px w-5 bg-slate-200" />
        SettleAI is drafting
        <span className="flex gap-0.5">
          {[0, 150, 300].map((d) => (
            <span
              key={d}
              className="h-1 w-1 animate-bounce rounded-full bg-slate-400"
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-900">Invoice draft</p>
          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600">
            Ready to review
          </span>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <p className="text-[11px] leading-tight text-slate-500">
            Logo design
            <br />
            Due Friday
          </p>
          <p className="text-2xl font-bold tabular-nums text-[#1E1B3A]">
            $1,200.00
          </p>
        </div>
      </div>
    </div>
  );
}

function InvoicePreview() {
  return (
    <div className="text-left">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs font-bold text-slate-700">INV-0042</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Sent
        </span>
      </div>

      <dl className="mt-4 space-y-2.5 text-[13px]">
        <div className="flex justify-between">
          <dt className="text-slate-500">Bill to</dt>
          <dd className="font-medium text-slate-800">Brew &amp; Co.</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Due</dt>
          <dd className="font-medium text-slate-800">Friday</dd>
        </div>
        <div className="flex justify-between border-t border-dashed border-slate-200 pt-3">
          <dt className="font-semibold text-slate-900">Total</dt>
          <dd className="font-bold tabular-nums text-slate-900">$1,200.00</dd>
        </div>
      </dl>

      <div className="mt-5 flex w-full items-center justify-center rounded-full bg-[#FFC439] py-2.5 text-sm font-semibold text-[#003087] shadow-sm">
        Pay with PayPal
      </div>
      <p className="mt-2.5 text-center text-[11px] text-slate-400">
        Payment link emailed to your client
      </p>
    </div>
  );
}

function ReminderPreview() {
  return (
    <div className="text-left">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-600">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Overdue · 3 days
        </span>
        <div className="flex gap-1 rounded-full bg-slate-100 p-0.5 text-[10px] font-semibold">
          <span className="rounded-full bg-white px-2.5 py-1 text-slate-800 shadow-xs">
            Friendly
          </span>
          <span className="px-2.5 py-1 text-slate-400">Firm</span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-[13px] leading-relaxed text-slate-600">
        Hi Sam, a quick nudge on invoice INV-0042, which was due on Friday. Happy
        to resend the payment link if that&apos;s easier. Thanks so much!
      </div>

      <div className="mt-4 flex gap-2">
        <span className="flex-1 rounded-full bg-[#25252A] py-2 text-center text-xs font-semibold text-white">
          Approve &amp; send
        </span>
        <span className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">
          Edit
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface StepItem {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  preview: React.ReactNode;
}

const iconProps = {
  className: "h-6 w-6",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const steps: StepItem[] = [
  {
    number: "01",
    title: "Paste a message",
    description:
      "Drop in a client email or a one-line job description. SettleAI turns it into a complete payment request with a custom PayPal invoice.",
    icon: (
      <svg {...iconProps}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M7 8h10M7 12h6" />
      </svg>
    ),
    preview: <MessagePreview />,
  },
  {
    number: "02",
    title: "Client pays with PayPal",
    description:
      "You approve it and a real PayPal invoice goes out with a payment link.",
    icon: (
      <svg {...iconProps}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20M6 15h4" />
      </svg>
    ),
    preview: <InvoicePreview />,
  },
  {
    number: "03",
    title: "AI follows up",
    description:
      "If it goes overdue, the AI drafts a reminder in the right tone for you to approve.",
    icon: (
      <svg {...iconProps}>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    ),
    preview: <ReminderPreview />,
  },
];

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const rootRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      // Highlight whichever step is crossing the middle of the viewport
      stepRefs.current.forEach((el, idx) => {
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 60%",
          end: "bottom 60%",
          onToggle: (self) => {
            if (self.isActive) setActiveStep(idx);
          },
        });
      });

      if (reduceMotion) {
        gsap.set(progressRef.current, { scaleY: 1 });
        return;
      }

      // Header intro
      gsap.from(".how-header > *", {
        y: 28,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 80%",
          once: true,
        },
      });

      // Gradient progress line fills as you scroll
      gsap.fromTo(
        progressRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: timelineRef.current,
            start: "top 60%",
            end: "bottom 60%",
            scrub: 0.4,
          },
        }
      );

      // Each step fades up as it enters
      stepRefs.current.forEach((el) => {
        if (!el) return;
        gsap.from(el, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="how-it-works"
      className="relative isolate overflow-hidden px-4 py-20 sm:px-6 sm:py-28 -mt-19"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-20 -z-10 h-72 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-200/40 via-purple-200/40 to-pink-200/40 blur-3xl"
      />

      <div className="mx-auto max-w-5xl">
        <div className="how-header text-center">
          <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#1E1B3A] sm:text-5xl md:text-6xl">
            Get paid in three steps
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
            From a pasted message to money in your account. SettleAI handles the
            invoice and the awkward follow-ups, and you stay in control the whole
            way.
          </p>
        </div>

        <div ref={timelineRef} className="relative mt-16 sm:mt-24">
          <div
            aria-hidden
            className="absolute bottom-0 left-5 top-0 -ml-px w-px bg-slate-200 md:left-1/2"
          />
          <div
            ref={progressRef}
            aria-hidden
            className="absolute bottom-0 left-5 top-0 -ml-px w-[2px] origin-top bg-gradient-to-b from-[#60a5fa] via-[#c084fc] to-[#f472b6] md:left-1/2"
            style={{ transform: "scaleY(0)" }}
          />

          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            const reached = idx <= activeStep;
            const flip = idx % 2 === 1;

            return (
              <div
                key={step.number}
                ref={(el) => {
                  stepRefs.current[idx] = el;
                }}
                className="relative pb-14 pl-14 last:pb-0 md:pb-24 md:pl-0"
              >
                <div className="absolute left-5 top-8 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center md:left-1/2">
                  {isActive ? (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 via-purple-400 to-pink-400 p-[2px] shadow-lg shadow-purple-400/30">
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-white">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
                      </span>
                    </span>
                  ) : (
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border bg-white transition-colors duration-500 ${
                        reached ? "border-slate-300" : "border-slate-200"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full transition-colors duration-500 ${
                          reached ? "bg-slate-900" : "bg-slate-200"
                        }`}
                      />
                    </span>
                  )}
                </div>

                <div className="grid items-center gap-6 md:grid-cols-2 md:gap-x-24">
                  <div className={flip ? "md:order-2" : ""}>
                    <div
                      className={`rounded-3xl border p-6 text-left transition-all duration-500 sm:p-8 ${
                        isActive
                          ? "border-slate-200 bg-white shadow-[0_20px_50px_-20px_rgba(30,27,58,0.25)]"
                          : "border-transparent bg-white/40 opacity-70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-500 ${
                            isActive
                              ? "bg-[#25252A] text-white shadow-md shadow-slate-900/20"
                              : "bg-[#F0F2F5] text-slate-600"
                          }`}
                        >
                          {step.icon}
                        </div>
                        <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-mono text-[11px] font-bold text-slate-700">
                          STEP {step.number}
                        </span>
                      </div>
                      <h3 className="mt-5 text-xl font-bold text-[#1E1B3A] sm:text-2xl">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* UI preview */}
                  <div className={flip ? "md:order-1" : ""}>
                    <div
                      className={`relative transition-all duration-500 ${
                        isActive
                          ? "scale-100 opacity-100"
                          : "scale-[0.97] opacity-60"
                      }`}
                    >
                      <div
                        aria-hidden
                        className={`absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-cyan-200/50 via-purple-200/50 to-pink-200/50 blur-2xl transition-opacity duration-500 ${
                          isActive ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      <div className="relative rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                        {step.preview}
                      </div>
                    </div>
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