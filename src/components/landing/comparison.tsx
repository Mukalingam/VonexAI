"use client";

import { Check, X, Minus } from "lucide-react";

interface FeatureRow {
  feature: string;
  vonexai: boolean | string;
  voiceflow: boolean | string;
  blandai: boolean | string;
  retellai: boolean | string;
}

const features: FeatureRow[] = [
  {
    feature: "No-Code Builder",
    vonexai: true,
    voiceflow: true,
    blandai: false,
    retellai: false,
  },
  {
    feature: "Phone Calling",
    vonexai: true,
    voiceflow: false,
    blandai: true,
    retellai: true,
  },
  {
    feature: "5,000+ Voices",
    vonexai: true,
    voiceflow: "Limited",
    blandai: false,
    retellai: true,
  },
  {
    feature: "Multi-LLM Support",
    vonexai: true,
    voiceflow: "Limited",
    blandai: false,
    retellai: "Limited",
  },
  {
    feature: "Knowledge Base (RAG)",
    vonexai: true,
    voiceflow: true,
    blandai: false,
    retellai: false,
  },
  {
    feature: "Call Transcripts",
    vonexai: true,
    voiceflow: false,
    blandai: true,
    retellai: true,
  },
  {
    feature: "Call Recording",
    vonexai: true,
    voiceflow: false,
    blandai: true,
    retellai: true,
  },
  {
    feature: "Website Embed",
    vonexai: true,
    voiceflow: true,
    blandai: false,
    retellai: true,
  },
  {
    feature: "Multi-Language (29+)",
    vonexai: true,
    voiceflow: "Limited",
    blandai: true,
    retellai: true,
  },
  {
    feature: "Analytics Dashboard",
    vonexai: true,
    voiceflow: true,
    blandai: false,
    retellai: true,
  },
  {
    feature: "Free Tier",
    vonexai: true,
    voiceflow: true,
    blandai: false,
    retellai: false,
  },
  {
    feature: "Starting Price",
    vonexai: "$49/mo",
    voiceflow: "$50/mo",
    blandai: "$0.09/min",
    retellai: "$0.07/min",
  },
];

const competitors = [
  { key: "voiceflow" as const, name: "Voiceflow" },
  { key: "blandai" as const, name: "Bland AI" },
  { key: "retellai" as const, name: "Retell AI" },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    if (value === "Limited") {
      return (
        <span className="inline-flex items-center gap-1 text-amber-600">
          <Minus className="h-4 w-4" />
          <span className="text-xs">{value}</span>
        </span>
      );
    }
    return <span className="text-sm font-medium text-[#F8FAFC]">{value}</span>;
  }
  if (value) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#DE6C33]/15">
        <Check className="h-4 w-4 text-[#DE6C33]" />
      </span>
    );
  }
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10">
      <X className="h-4 w-4 text-red-400" />
    </span>
  );
}

function MobileComparisonCard({
  feature,
}: {
  feature: FeatureRow;
}) {
  return (
    <div className="rounded-xl border border-[#334155]/50 bg-[#0F172A]/60 backdrop-blur-sm p-4">
      <p className="text-sm font-semibold text-[#F8FAFC] mb-3">
        {feature.feature}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center justify-between rounded-lg bg-[#2E3192]/10 px-3 py-2">
          <span className="text-xs font-bold text-[#DE6C33]">Vonex AI</span>
          <CellValue value={feature.vonexai} />
        </div>
        {competitors.map((comp) => (
          <div
            key={comp.key}
            className="flex items-center justify-between rounded-lg bg-[#1E293B]/50 px-3 py-2"
          >
            <span className="text-xs text-[#94A3B8]">{comp.name}</span>
            <CellValue value={feature[comp.key]} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Comparison() {
  return (
    <section id="comparison" className="relative py-20 sm:py-28">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F172A]/30 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[#2E3192]/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2E3192]/20 bg-[#2E3192]/5 px-4 py-1.5 text-sm font-medium text-[#DE6C33]">
            Compare
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#F8FAFC] sm:text-4xl lg:text-5xl">
            See How Vonex AI{" "}
            <span className="bg-gradient-to-r from-[#DE6C33] to-[#F2A339] bg-clip-text text-transparent">
              Stacks Up
            </span>
          </h2>
          <p className="mt-4 text-base text-[#94A3B8] sm:text-lg leading-relaxed">
            The most complete platform for building AI voice agents, at a
            fraction of the cost.
          </p>
        </div>

        {/* Mobile: Card layout */}
        <div className="mt-12 grid gap-4 md:hidden">
          {features.map((row) => (
            <MobileComparisonCard key={row.feature} feature={row} />
          ))}
        </div>

        {/* Desktop: Table layout */}
        <div className="mt-16 hidden md:block">
          {/* Header row */}
          <div className="grid grid-cols-5 gap-px rounded-t-2xl bg-[#334155]/30 overflow-hidden">
            <div className="bg-[#0F172A]/80 backdrop-blur-sm p-4">
              <span className="text-sm font-medium text-[#94A3B8]">
                Feature
              </span>
            </div>
            <div className="bg-[#2E3192]/10 p-4 text-center">
              <span className="text-sm font-bold text-[#DE6C33]">Vonex AI</span>
            </div>
            <div className="bg-[#0F172A]/80 backdrop-blur-sm p-4 text-center">
              <span className="text-sm font-medium text-[#94A3B8]">
                Voiceflow
              </span>
            </div>
            <div className="bg-[#0F172A]/80 backdrop-blur-sm p-4 text-center">
              <span className="text-sm font-medium text-[#94A3B8]">
                Bland AI
              </span>
            </div>
            <div className="bg-[#0F172A]/80 backdrop-blur-sm p-4 text-center">
              <span className="text-sm font-medium text-[#94A3B8]">
                Retell AI
              </span>
            </div>
          </div>

          {/* Data rows */}
          {features.map((row, index) => (
            <div
              key={row.feature}
              className={`grid grid-cols-5 gap-px ${index === features.length - 1 ? "rounded-b-2xl overflow-hidden" : ""}`}
            >
              <div className="bg-[#0F172A]/60 backdrop-blur-sm p-4">
                <span className="text-sm font-medium text-[#F8FAFC]">
                  {row.feature}
                </span>
              </div>
              <div className="flex items-center justify-center bg-[#2E3192]/10 p-4">
                <CellValue value={row.vonexai} />
              </div>
              <div className="flex items-center justify-center bg-[#0F172A]/60 backdrop-blur-sm p-4">
                <CellValue value={row.voiceflow} />
              </div>
              <div className="flex items-center justify-center bg-[#0F172A]/60 backdrop-blur-sm p-4">
                <CellValue value={row.blandai} />
              </div>
              <div className="flex items-center justify-center bg-[#0F172A]/60 backdrop-blur-sm p-4">
                <CellValue value={row.retellai} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
