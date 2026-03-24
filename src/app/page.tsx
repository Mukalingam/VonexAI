import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { PhoneCalling } from "@/components/landing/phone-calling";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Domains } from "@/components/landing/domains";
import { Comparison } from "@/components/landing/comparison";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { CtaBanner } from "@/components/landing/cta-banner";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0F] text-[#F8FAFC]">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <PhoneCalling />
        <HowItWorks />
        <Domains />
        <Comparison />
        <Testimonials />
        <Pricing />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
