import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Subhero from "@/components/landing/Subhero";
import HowItWorks from "@/components/landing/HowItWorks";
import KeyBenefits from "@/components/landing/KeyBenefits";
import CtaBanner from "@/components/landing/CtaBanner";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#00c2ff] selection:text-white">
      <Navbar />
      <main className="space-y-24 pb-20">
        <Hero />
        <Subhero/>
        <HowItWorks />
        <KeyBenefits/>
        <CtaBanner/>
      </main>
      <Footer />
    </div>
  );
}
