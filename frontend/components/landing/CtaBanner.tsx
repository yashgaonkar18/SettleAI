"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CtaBanner() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(root);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
      });

      tl.from(".cta-card", { scale: 0.93, y: 60, opacity: 0, duration: 1, ease: "power3.out" })
        .from(".cta-word", { yPercent: 110, duration: 0.8, stagger: 0.1, ease: "power4.out" }, "-=0.5")
        .from(".cta-sub", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(".cta-arrow", { clipPath: "inset(0 100% 0 0)", duration: 0.9, ease: "power2.inOut" }, "-=0.2")
        .from(".cta-btn", { scale: 0.6, opacity: 0, duration: 0.5, ease: "back.out(2)" }, "-=0.3")
        .from(".cta-mark", { yPercent: 60, opacity: 0, duration: 1.1, ease: "power4.out" }, "-=0.9")
        .from(".cta-chip", { scale: 0.6, opacity: 0, duration: 0.6, stagger: 0.2, ease: "back.out(2)" }, "-=0.6");


      gsap.utils.toArray<HTMLElement>(".cta-blob").forEach((el) => {
        gsap.to(el, {
          x: "random(-60, 60)",
          y: "random(-40, 40)",
          duration: "random(5, 8)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      gsap.fromTo(
        ".cta-ring",
        { scale: 1, opacity: 0.6 },
        { scale: 1.35, opacity: 0, duration: 1.6, repeat: -1, ease: "power2.out", delay: 2.5 }
      );
    });

    return () => mm.revert();
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    gsap.to(el, {
      x: (e.clientX - r.left - r.width / 2) * 0.25,
      y: (e.clientY - r.top - r.height / 2) * 0.35,
      duration: 0.3,
      ease: "power2.out",
    });
  };
  const onLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
  };

  return (
    <section ref={root} className="max-w-7xl mx-auto px-6 mt-40">
      <div className="cta-card relative rounded-[40px] bg-gradient-to-r from-[#00d2ff] via-[#00aaff] to-[#0070ba] p-10 md:p-16 pb-0 md:pb-0 text-white overflow-hidden shadow-2xl flex flex-col items-center">
        <div className="cta-blob pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="cta-blob pointer-events-none absolute bottom-10 right-1/4 h-64 w-64 rounded-full bg-cyan-200/30 blur-3xl" />

        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl text-left space-y-4">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              {["Ready", "to", "get", "started?"].map((w) => (
                <span key={w} className="inline-block overflow-hidden align-top pb-1 -mb-1 mr-[0.25em]">
                  <span className="cta-word inline-block">{w}</span>
                </span>
              ))}
            </h2>
            <p className="cta-sub text-sm text-white/90">
              Built for the PayPal AI Hackathon with Gemini AI and PayPal Sandbox Orders v2.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Image
              src="/doodle.svg"
              alt="arrow"
              width={100}
              height={100}
              className="cta-arrow -mt-5 hidden sm:block"
            />
            <div onMouseMove={onMove} onMouseLeave={onLeave} className="cta-btn relative">
              <span className="cta-ring pointer-events-none absolute inset-0 rounded-full border-2 border-white" />
              <Link
                href="/dashboard"
                className="group relative inline-block overflow-hidden bg-white text-slate-950 px-8 py-3.5 rounded-full font-bold text-sm shadow-xl"
              >
                <span className="relative z-10">Try It Out</span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-sky-200/80 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
            </div>
          </div>
        </div>

        <div className="cta-mark mt-15 -mb-6 sm:mb-1 md:-mb-7 select-none pointer-events-none">
          <h1 className="text-6xl sm:text-8xl md:text-[10rem] lg:text-[12rem] font-black leading-none tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white/90 to-white/20 whitespace-nowrap">
            SettleAI<span className="bg-clip-text text-transparent bg-gradient-to-b from-white/90 to-white/20">.</span>
          </h1>
        </div>
      </div>
    </section>
  );
}