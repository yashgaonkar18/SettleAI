"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface StepItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
}

const steps: StepItem[] = [
  {
    id: "01",
    title: "Late payments",
    description: "Most late invoices aren't ignored on purpose. They get forgotten, misplaced, or buried in an overcrowded inbox.",
    tag: "Average 18+ days overdue",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "02",
    title: "Awkward follow-ups",
    description: "Chasing a client feels uncomfortable and friction-heavy, so freelancers procrastinate reminders for weeks.",
    tag: "Uncomfortable conversations",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="8" y1="10" x2="8.01" y2="10" strokeWidth="3" />
        <line x1="12" y1="10" x2="12.01" y2="10" strokeWidth="3" />
        <line x1="16" y1="10" x2="16.01" y2="10" strokeWidth="3" />
      </svg>
    ),
  },
  {
    id: "03",
    title: "Surprise cash gaps",
    description: "You only discover the shortfall when bills and rent are already due and the promised funds haven't arrived.",
    tag: "Stressful cash flow drops",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        <line x1="3" y1="3" x2="21" y2="21" />
      </svg>
    ),
  },
];

const TITLE = "Getting paid shouldn't be this hard";

export default function Subhero() {
  const rootRef = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    // Respect users who prefer reduced motion: leave everything visible.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 85%",
          once: true,
        },
      });

      tl.fromTo(
        ".subhero-panel",
        { autoAlpha: 0, y: 30, scale: 0.98 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.7 }
      )
        .fromTo(
          ".subhero-word",
          { yPercent: 110, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.7, stagger: 0.06 },
          "-=0.4"
        )
        .fromTo(
          ".subhero-card",
          { autoAlpha: 0, y: 60, scale: 0.95 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.14,
            ease: "back.out(1.4)",
            clearProps: "transform,opacity,visibility", // hand control back to CSS/hover
          },
          "-=0.35"
        )
        .fromTo(
          ".subhero-icon",
          { scale: 0, rotate: -45 },
          {
            scale: 1,
            rotate: 0,
            duration: 0.6,
            stagger: 0.14,
            ease: "back.out(2)",
            clearProps: "transform",
          },
          "<0.25"
        )
        .fromTo(
          ".subhero-tag",
          { autoAlpha: 0, x: -10 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.14,
            clearProps: "transform,opacity,visibility",
          },
          "<0.15"
        );
    }, rootRef);

    // Positions can shift after fonts/images load, which is a common reason a
    // trigger never fires. Re-measure once everything has settled.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={rootRef} id="subhero" className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="subhero-panel relative isolate overflow-hidden rounded-3xl px-6 py-16 sm:py-20 sm:px-12 text-center bg-[#F3F4F6]">
        {/* decorative glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-[#00c2ff]/10 blur-3xl"
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2
            aria-label={TITLE}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#1E1B3A] mt-4 leading-tight"
          >
            {TITLE.split(" ").map((word, i) => (
              <span
                key={`${word}-${i}`}
                aria-hidden="true"
                className="inline-block overflow-hidden align-bottom py-[0.08em] mr-[0.25em] last:mr-0"
              >
                <span className="subhero-word inline-block will-change-transform">{word}</span>
              </span>
            ))}
          </h2>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mt-12 text-left">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              // GSAP animates this wrapper only. Hover styles live on the inner
              // card, so the CSS transition never fights GSAP.
              <div key={item.id} className="subhero-card">
                <div className="group relative h-full bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-xl border border-white/70 hover:border-cyan-200 flex flex-col justify-between transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1.5">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="subhero-icon w-12 h-12 rounded-2xl bg-cyan-50 text-[#00a3d9] flex items-center justify-center group-hover:bg-[#00c2ff] group-hover:text-white transition-colors duration-300 shadow-sm">
                        <Icon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-[#00a3d9] transition-colors">
                        {item.id}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-[#008dbd] transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span className="subhero-tag inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {item.tag}
                    </span>
                    <span className="text-slate-300 group-hover:text-[#00a3d9] group-hover:translate-x-0.5 transition-all">
                      &rarr;
                    </span>
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