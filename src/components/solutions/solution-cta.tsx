import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface SolutionCtaProps {
  domainName: string;
}

export function SolutionCta({ domainName }: SolutionCtaProps) {
  return (
    <section className="py-20 border-t border-[#334155]/30">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <div className="rounded-3xl border border-[#334155]/50 bg-gradient-to-br from-[#0F172A] to-[#0F172A]/80 p-10 sm:p-16">
          <Sparkles className="mx-auto mb-4 h-8 w-8 text-[#F2A339]" />
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to Transform Your {domainName} Operations?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#94A3B8] text-lg">
            Create your first {domainName.toLowerCase()} AI agent in under 5 minutes. No credit card required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group flex items-center gap-2 rounded-full bg-[#DE6C33] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#D64700]"
            >
              Create {domainName} Agent
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-[#334155] px-8 py-4 text-base font-medium text-[#F8FAFC] transition-colors hover:border-[#94A3B8]"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
