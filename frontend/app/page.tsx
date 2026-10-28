"use client";

import { useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Subhero from "@/components/landing/Subhero";
import Banner from "@/components/landing/Banner";
import HowItWorks from "@/components/landing/HowItWorks";
import Scroll from "@/components/landing/Scroll";
import KeyBenefits from "@/components/landing/KeyBenefits";
import CtaBanner from "@/components/landing/CtaBanner";
import Footer from "@/components/landing/Footer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

export default function LandingPage() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 0.7,
      effects: true,
      smoothTouch: 0.1,
    });

    // Ensure ScrollTrigger has computed accurate heights and positions after mount
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(timer);
      smoother.kill();
    };
  }, []);

  return (
    <>
      <Navbar />
      <div id="smooth-wrapper">
        <div
          id="smooth-content"
          className="min-h-screen bg-white text-slate-900 selection:bg-[#00c2ff] selection:text-white"
        >
          <main className="space-y-20 pb-20 pt-20">
            <Hero />
            <Subhero />
            <Banner />
            <HowItWorks />
            <Scroll />
            <KeyBenefits />
            <CtaBanner />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}