import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2E3192] via-[#1a1d5e] to-[#0F172A] px-6 py-16 sm:px-16 sm:py-20">
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#DE6C33]/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#2E3192]/20 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-white/5 blur-2xl animate-float-slow" />
          </div>

          <div className="relative mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">
              <Sparkles className="h-4 w-4" />
              Start Building Today
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to Build Your{" "}
              <span className="bg-gradient-to-r from-[#DE6C33] to-[#F2A339] bg-clip-text text-transparent sm:block">
                AI Voice Agent?
              </span>
            </h2>

            <p className="mt-4 text-base text-white/70 sm:text-lg leading-relaxed">
              Join thousands of businesses using Vonex AI to automate
              conversations, delight customers, and scale effortlessly.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                asChild
                className="bg-[#DE6C33] text-white hover:bg-[#D64700] shadow-lg shadow-[#DE6C33]/30 border-0 rounded-full px-8"
              >
                <Link href="/signup">
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/30 text-white hover:bg-white/10 bg-transparent rounded-full px-8"
              >
                <Link href="/contact">Book a Demo</Link>
              </Button>
            </div>

            <p className="mt-4 text-xs text-white/50">
              No credit card required &middot; Free tier available &middot;
              Deploy in minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
