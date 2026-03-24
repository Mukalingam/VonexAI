"use client";

import Link from "next/link";
import { Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  price: string;
  priceSubtext: string;
  description: string;
  features: PricingFeature[];
  cta: string;
  ctaHref: string;
  popular: boolean;
  gradient: string;
  iconBg: string;
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    priceSubtext: "/month",
    description: "Perfect for exploring and prototyping your first voice agent.",
    features: [
      { text: "2 voice agents", included: true },
      { text: "100 conversations/month", included: true },
      { text: "10 phone calls/month", included: true },
      { text: "5 MB knowledge base", included: true },
      { text: "Basic analytics", included: true },
      { text: "50 standard voices", included: true },
      { text: "Community support", included: true },
      { text: "Call recordings", included: false },
      { text: "Voice cloning", included: false },
      { text: "Webhooks & API access", included: false },
    ],
    cta: "Get Started",
    ctaHref: "/signup",
    popular: false,
    gradient: "from-slate-400 to-zinc-500",
    iconBg: "bg-slate-100",
  },
  {
    name: "Pro",
    price: "$49",
    priceSubtext: "/month",
    description: "For teams building production-grade voice and phone experiences.",
    features: [
      { text: "25 voice agents", included: true },
      { text: "5,000 conversations/month", included: true },
      { text: "1,000 phone calls/month", included: true },
      { text: "500 MB knowledge base", included: true },
      { text: "Advanced analytics", included: true },
      { text: "5,000+ premium voices", included: true },
      { text: "Call recordings & transcripts", included: true },
      { text: "Priority email support", included: true },
      { text: "Voice cloning", included: true },
      { text: "Webhooks & API access", included: true },
    ],
    cta: "Start Pro Trial",
    ctaHref: "/signup?plan=pro",
    popular: true,
    gradient: "from-indigo-500 to-indigo-600",
    iconBg: "bg-indigo-50",
  },
  {
    name: "Enterprise",
    price: "Custom",
    priceSubtext: "",
    description: "For organizations that need scale, compliance, and control.",
    features: [
      { text: "Unlimited voice agents", included: true },
      { text: "Unlimited conversations", included: true },
      { text: "Unlimited phone calls", included: true },
      { text: "Unlimited knowledge base", included: true },
      { text: "Custom analytics & reports", included: true },
      { text: "5,000+ premium voices", included: true },
      { text: "Call recordings & transcripts", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Voice cloning", included: true },
      { text: "White-label & HIPAA compliance", included: true },
    ],
    cta: "Contact Sales",
    ctaHref: "/contact",
    popular: false,
    gradient: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-50",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-20 sm:py-28">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-0 h-[400px] w-[400px] rounded-full bg-[#2E3192]/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 h-[400px] w-[400px] rounded-full bg-[#DE6C33]/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DE6C33]/20 bg-[#DE6C33]/5 px-4 py-1.5 text-sm font-medium text-[#DE6C33]">
            Pricing
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#F8FAFC] sm:text-4xl lg:text-5xl">
            Simple,{" "}
            <span className="bg-gradient-to-r from-[#DE6C33] to-[#F2A339] bg-clip-text text-transparent">
              Transparent
            </span>{" "}
            Pricing
          </h2>
          <p className="mt-4 text-base text-[#94A3B8] sm:text-lg leading-relaxed">
            Start free. Scale when you are ready. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:gap-6 lg:grid-cols-3 items-start">
          {tiers.map((tier, index) => (
            <div
              key={tier.name}
              className={cn(
                "group relative flex flex-col rounded-2xl border bg-[#0F172A]/60 backdrop-blur-md shadow-sm transition-all duration-500 hover:shadow-xl sm:p-8 p-6 opacity-0 animate-fade-up",
                tier.popular
                  ? "border-[#DE6C33]/40 shadow-lg shadow-[#DE6C33]/10 lg:scale-105 lg:-my-4"
                  : "border-[#334155]/50 hover:-translate-y-1"
              )}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Popular glow */}
              {tier.popular && (
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[#DE6C33]/20 via-transparent to-[#DE6C33]/20 -z-10" />
              )}

              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#DE6C33] to-[#F2A339] px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-[#DE6C33]/30">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan name & price */}
              <div>
                <h3 className="text-lg font-semibold text-[#F8FAFC]">
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className={cn(
                    "text-4xl font-bold tracking-tight",
                    tier.popular
                      ? "bg-gradient-to-r from-[#DE6C33] to-[#F2A339] bg-clip-text text-transparent"
                      : "text-[#F8FAFC]"
                  )}>
                    {tier.price}
                  </span>
                  {tier.priceSubtext && (
                    <span className="ml-1 text-sm text-[#94A3B8]">
                      {tier.priceSubtext}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-[#94A3B8] leading-relaxed">
                  {tier.description}
                </p>
              </div>

              {/* Divider */}
              <div className={cn(
                "my-6 h-px",
                tier.popular
                  ? "bg-gradient-to-r from-transparent via-[#DE6C33]/30 to-transparent"
                  : "bg-[#334155]/50"
              )} />

              {/* Features */}
              <ul className="flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3">
                    {feature.included ? (
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DE6C33]/15">
                        <Check className="h-3 w-3 text-[#DE6C33]" />
                      </div>
                    ) : (
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1E293B]">
                        <X className="h-3 w-3 text-[#94A3B8]/40" />
                      </div>
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        feature.included
                          ? "text-[#F8FAFC]"
                          : "text-[#94A3B8]/50"
                      )}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <div className="mt-8">
                <Button
                  variant={tier.popular ? "default" : "outline"}
                  className={cn(
                    "w-full transition-all duration-300",
                    tier.popular
                      ? "bg-[#DE6C33] hover:bg-[#D64700] text-white shadow-lg shadow-[#DE6C33]/20 hover:shadow-[#DE6C33]/30 border-0"
                      : "border-[#334155] text-[#F8FAFC] hover:bg-[#1E293B] hover:border-[#DE6C33]/30"
                  )}
                  size="lg"
                  asChild
                >
                  <Link href={tier.ctaHref}>{tier.cta}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
