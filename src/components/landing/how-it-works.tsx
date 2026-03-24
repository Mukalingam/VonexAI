"use client";

import { LayoutGrid, Settings2, MessageSquare, Phone } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: LayoutGrid,
    title: "Choose a Domain",
    description:
      "Pick from 17 industry templates — healthcare, sales, insurance, solar, and more with 100+ agent types.",
  },
  {
    number: "02",
    icon: Settings2,
    title: "Configure Your Agent",
    description:
      "Set voice, personality, LLM model, knowledge base, and advanced behaviors with our no-code builder.",
  },
  {
    number: "03",
    icon: Phone,
    title: "Connect Phone Numbers",
    description:
      "Import your phone numbers and assign agents to handle inbound calls and make outbound calls.",
  },
  {
    number: "04",
    icon: MessageSquare,
    title: "Test & Go Live",
    description:
      "Test in the sandbox, then deploy via web embed, phone, API, or shareable link — all in minutes.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 sm:py-28">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F172A]/30 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2E3192]/20 bg-[#2E3192]/5 px-4 py-1.5 text-sm font-medium text-[#DE6C33]">
            How It Works
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#F8FAFC] sm:text-4xl lg:text-5xl">
            Up and Running in{" "}
            <span className="bg-gradient-to-r from-[#DE6C33] to-[#F2A339] bg-clip-text text-transparent">
              4 Simple Steps
            </span>
          </h2>
          <p className="mt-4 text-base text-[#94A3B8] sm:text-lg leading-relaxed">
            From idea to live voice agent in minutes, not months.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-16">
          {/* Connecting line (desktop) */}
          <div className="absolute top-24 left-0 right-0 hidden h-px bg-gradient-to-r from-transparent via-[#2E3192]/20 to-transparent lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="group relative flex flex-col items-center text-center opacity-0 animate-fade-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Number circle */}
                <div className="relative mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2E3192] to-[#1a1d5e] shadow-lg shadow-[#2E3192]/20 transition-transform duration-300 group-hover:scale-110">
                    <step.icon className="h-9 w-9 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#DE6C33] text-xs font-bold text-white shadow-md">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-[#F8FAFC]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
