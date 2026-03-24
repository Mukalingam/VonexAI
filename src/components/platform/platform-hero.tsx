import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface PlatformHeroProps {
  icon: React.ElementType;
  title: string;
  highlight: string;
  description: string;
  gradient: string;
}

export function PlatformHero({ icon: Icon, title, highlight, description, gradient }: PlatformHeroProps) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute -top-[40%] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full ${gradient} blur-3xl opacity-20`} />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
        {/* Icon badge */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#DE6C33]/10 border border-[#DE6C33]/20">
          <Icon className="h-8 w-8 text-[#DE6C33]" />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          {title}{" "}
          <span className="bg-gradient-to-r from-[#DE6C33] to-[#F2A339] bg-clip-text text-transparent">
            {highlight}
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-[#94A3B8] leading-relaxed">
          {description}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="group flex items-center gap-2 rounded-full bg-[#DE6C33] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#D64700]"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/signin"
            className="rounded-full border border-[#334155] px-8 py-4 text-base font-medium text-[#F8FAFC] transition-colors hover:border-[#94A3B8]"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
