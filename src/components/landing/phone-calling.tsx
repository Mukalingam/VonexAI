"use client";

import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  FileText,
  BarChart3,
  Shield,
  Headphones,
  Zap,
} from "lucide-react";

const capabilities = [
  {
    icon: PhoneOutgoing,
    title: "Outbound Calls",
    description:
      "Your AI agents make outbound calls for lead qualification, follow-ups, appointment reminders, and sales outreach.",
  },
  {
    icon: PhoneIncoming,
    title: "Inbound Calls",
    description:
      "Assign agents to phone numbers so they automatically answer inbound calls 24/7 with consistent quality.",
  },
  {
    icon: FileText,
    title: "Live Transcripts",
    description:
      "Every call is automatically transcribed with speaker labels, timestamps, and searchable conversation history.",
  },
  {
    icon: Headphones,
    title: "Call Recording",
    description:
      "Recordings are available for playback, quality assurance review, and training data for improving agents.",
  },
  {
    icon: BarChart3,
    title: "Call Analytics",
    description:
      "Track call volume, success rates, average duration, sentiment scores, and agent performance metrics.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Encrypted credentials, row-level security, HIPAA-ready architecture, and SOC 2 compliant infrastructure.",
  },
];

export function PhoneCalling() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2E3192]/5 via-transparent to-[#2E3192]/5" />
        <div className="absolute top-1/4 right-0 h-[500px] w-[500px] rounded-full bg-[#2E3192]/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-0 h-[400px] w-[400px] rounded-full bg-[#00A2C7]/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-sm font-medium text-emerald-400">
              <Phone className="h-3.5 w-3.5" />
              Phone Calling
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#F8FAFC] sm:text-4xl lg:text-5xl">
              AI Agents That Make{" "}
              <span className="bg-gradient-to-r from-[#DE6C33] to-[#F2A339] bg-clip-text text-transparent">
                Real Phone Calls
              </span>
            </h2>
            <p className="mt-4 text-base text-[#94A3B8] sm:text-lg leading-relaxed">
              Connect your phone numbers and let AI agents handle inbound and outbound
              calls with natural conversation. Full transcripts, recordings, and analytics included.
            </p>

            {/* Quick stats */}
            <div className="mt-8 flex gap-6">
              <div>
                <div className="text-2xl font-bold text-[#F8FAFC]">{"<"}2s</div>
                <div className="text-xs text-[#94A3B8]">Response Time</div>
              </div>
              <div className="h-12 w-px bg-[#334155]" />
              <div>
                <div className="text-2xl font-bold text-[#F8FAFC]">24/7</div>
                <div className="text-xs text-[#94A3B8]">Availability</div>
              </div>
              <div className="h-12 w-px bg-[#334155]" />
              <div>
                <div className="text-2xl font-bold text-[#F8FAFC]">29+</div>
                <div className="text-xs text-[#94A3B8]">Languages</div>
              </div>
            </div>

            {/* Feature badges */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-[#334155]/50 bg-[#0F172A]/60 px-4 py-2 text-sm text-[#F8FAFC]">
                <Zap className="h-4 w-4 text-red-400" />
                <span className="font-medium">Enterprise Telephony</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#334155]/50 bg-[#0F172A]/60 px-4 py-2 text-sm text-[#F8FAFC]">
                <Headphones className="h-4 w-4 text-[#DE6C33]" />
                <span className="font-medium">Premium AI Voices</span>
              </div>
            </div>
          </div>

          {/* Right: Phone mockup */}
          <div className="relative">
            <div className="relative mx-auto w-full max-w-sm">
              <div className="rounded-[2rem] border-4 border-[#1E293B] bg-[#0A0A0F] p-2 shadow-2xl shadow-black/60">
                <div className="rounded-[1.5rem] bg-[#0F172A] overflow-hidden">
                  {/* Phone header */}
                  <div className="bg-gradient-to-r from-[#2E3192] to-[#1a1d5e] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">AI Sales Agent</p>
                        <p className="text-xs text-white/70">+1 (415) 555-0123</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-white/80">Call in progress - 02:34</span>
                    </div>
                  </div>

                  {/* Call transcript preview */}
                  <div className="space-y-3 p-4">
                    <div className="flex gap-2">
                      <div className="h-6 w-6 rounded-full bg-[#1E293B] flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-[#94A3B8]">C</span>
                      </div>
                      <div className="rounded-2xl rounded-tl-sm bg-[#1E293B] px-3 py-2 text-xs text-[#F8FAFC]">
                        Hi, I&apos;m interested in your enterprise plan. Can you tell me more?
                      </div>
                    </div>
                    <div className="flex gap-2 flex-row-reverse">
                      <div className="h-6 w-6 rounded-full bg-[#2E3192]/30 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-[#DE6C33]">AI</span>
                      </div>
                      <div className="rounded-2xl rounded-tr-sm bg-[#2E3192] px-3 py-2 text-xs text-white">
                        Absolutely! Our enterprise plan includes unlimited agents, calls, and dedicated support. Let me walk you through the key benefits...
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-6 rounded-full bg-[#1E293B] flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-[#94A3B8]">C</span>
                      </div>
                      <div className="rounded-2xl rounded-tl-sm bg-[#1E293B] px-3 py-2 text-xs text-[#F8FAFC]">
                        That sounds great. Can we schedule a demo for next week?
                      </div>
                    </div>
                  </div>

                  {/* Call controls */}
                  <div className="flex items-center justify-center gap-6 border-t border-[#334155] px-4 py-4">
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E293B]">
                      <FileText className="h-4 w-4 text-[#94A3B8]" />
                    </button>
                    <button className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-500/30">
                      <Phone className="h-5 w-5 text-white rotate-[135deg]" />
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E293B]">
                      <BarChart3 className="h-4 w-4 text-[#94A3B8]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((cap, index) => (
            <div
              key={cap.title}
              className="group rounded-xl border border-[#334155]/50 bg-[#0F172A]/60 backdrop-blur-sm p-6 transition-all hover:shadow-md hover:border-[#2E3192]/30 opacity-0 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#2E3192]/10 transition-transform group-hover:scale-110">
                <cap.icon className="h-5 w-5 text-[#DE6C33]" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#F8FAFC]">
                {cap.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
                {cap.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
