"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { RollingText } from '@animate-ui/react/primitives/texts/rolling';

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Background subtle scale down to 1
      tl.from(".hero-bg-img", {
        scale: 1.08,
        duration: 1.8,
        ease: "power2.out",
      })
        // Staggered words reveal
        .from(
          ".hero-word",
          {
            y: 45,
            opacity: 0,
            duration: 0.85,
            stagger: 0.07,
            ease: "power4.out",
          },
          0.2
        )
        // Subtitle fade & slide
        .from(
          ".hero-desc",
          {
            y: 25,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.4"
        )
        // CTA button pop in
        .from(
          ".hero-cta",
          {
            scale: 0.7,
            opacity: 0,
            duration: 0.6,
            ease: "back.out(2)",
          },
          "-=0.3"
        )
        // Floating pill badges entrance
        .from(
          ".hero-pill",
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "back.out(1.5)",
          },
          "-=0.3"
        );

      // Continuous gentle floating animation for badges
      gsap.to(".hero-pill-left", {
        y: -8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".hero-pill-right", {
        y: 8,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // Magnetic button effect with GSAP
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
    gsap.to(btnRef.current, {
      x,
      y,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    if (!btnRef.current) return;
    gsap.to(btnRef.current, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.4)",
    });
  };

  return (
    <section ref={rootRef} className="px-4 sm:px-6 pt-6 max-w-7xl mx-auto">
      <div className="relative isolate overflow-hidden rounded-3xl text-center min-h-[600px] sm:min-h-[680px]">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            src="/bg.png"
            alt=""
            fill
            priority
            className="hero-bg-img object-cover object-bottom"
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-16 sm:pt-20">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#1E1B3A] leading-[1.1]">
            <span className="inline-block">
              {["Get", "paid", "faster."].map((w, idx) => (
                <span
                  key={idx}
                  className="hero-word inline-block mr-[0.25em] will-change-transform"
                >
                  <RollingText text={w} inView />
                </span>
              ))}
            </span>
            <span className="block text-[#1E1B3A]/50 mt-1">
              {["Let", "AI", "chase", "the", "invoices."].map((w, idx) => (
                <span
                  key={idx}
                  className="hero-word inline-block mr-[0.25em] will-change-transform"
                >
                  {w}
                </span>
              ))}
            </span>
          </h1>

          <p className="hero-desc mt-6 text-base sm:text-lg text-[#1E1B3A]/70 max-w-xl mx-auto leading-relaxed">
            Turn a plain message into a PayPal invoice, track who has paid, and
            let an AI agent write the follow-ups you never want to write.
          </p>

          <div className="mt-8 flex items-center justify-center">
            <div
              ref={btnRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="hero-cta inline-block"
            >
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center gap-2 bg-[#0f172b] text-white px-8 py-3.5 rounded-full font-medium text-sm shadow-xl hover:bg-[#334155] transition-all duration-300 hover:shadow-2xl"
              >
                <span>Try it now</span>
                <span className="text-white/60 group-hover:translate-x-1 transition-transform duration-200">
                  &rarr;
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}