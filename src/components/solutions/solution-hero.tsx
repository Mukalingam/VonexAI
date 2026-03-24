import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SolutionHeroProps {
  name: string;
  description: string;
  gradient: string;
}

export function SolutionHero({ name, description, gradient }: SolutionHeroProps) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute -top-[40%] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full ${gradient} blur-3xl opacity-20`} />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
        <div className="mb-4 inline-flex items-center rounded-full border border-[#DE6C33]/20 bg-[#DE6C33]/5 px-4 py-1.5 text-sm text-[#DE6C33]">
          Industry Solution
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          AI Agents for{" "}
          <span className="bg-gradient-to-r from-[#DE6C33] to-[#F2A339] bg-clip-text text-transparent">
            {name}
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-[#94A3B8] leading-relaxed">
          {description}. Deploy AI voice and chat agents tailored specifically for your industry in minutes.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="group flex items-center gap-2 rounded-full bg-[#DE6C33] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#D64700]"
          >
            Create {name} Agent
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/#pricing"
            className="rounded-full border border-[#334155] px-8 py-4 text-base font-medium text-[#F8FAFC] transition-colors hover:border-[#94A3B8]"
          >
            View Pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
