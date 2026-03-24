"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

/* ── Styles for pulse ring animation ── */
const pulseRingStyle = `
@keyframes pulse-ring {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
}
@keyframes waveform-bar {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}
@keyframes chat-appear {
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
}
`;

/* ── Human-Centric AI Agent Illustration ── */
function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-3xl opacity-0 animate-fade-up [animation-delay:0.35s]">
      <style dangerouslySetInnerHTML={{ __html: pulseRingStyle }} />

      <div className="relative flex items-center justify-center py-8" style={{ minHeight: 360 }}>
        {/* Pulse rings radiating from center */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full border border-[#DE6C33]"
            style={{
              width: 220 + i * 100,
              height: 220 + i * 100,
              animation: `pulse-ring 3s ease-out ${i * 0.8}s infinite`,
              opacity: 0,
            }}
          />
        ))}

        {/* Subtle background glow */}
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#DE6C33]/20 to-[#F2A339]/10 blur-3xl" />

        {/* ─── Left: Chat Bubbles ─── */}
        <div className="absolute left-[4%] top-[12%] flex flex-col gap-3 sm:left-[8%]">
          {/* AI message */}
          <div
            className="rounded-2xl rounded-bl-sm border border-[#334155] bg-[#0F172A]/90 px-4 py-3 backdrop-blur-sm"
            style={{ animation: "chat-appear 0.5s ease-out 0.6s both", maxWidth: 200 }}
          >
            <p className="text-xs text-[#94A3B8] mb-1">Vonex AI</p>
            <p className="text-sm text-[#F8FAFC]">Hello! How can I help you today?</p>
          </div>
          {/* User message */}
          <div
            className="self-end rounded-2xl rounded-br-sm bg-gradient-to-r from-[#2E3192] to-[#2E3192]/80 px-4 py-3"
            style={{ animation: "chat-appear 0.5s ease-out 1.2s both", maxWidth: 180 }}
          >
            <p className="text-sm text-white">I need to schedule a demo</p>
          </div>
          {/* AI response */}
          <div
            className="rounded-2xl rounded-bl-sm border border-[#334155] bg-[#0F172A]/90 px-4 py-3 backdrop-blur-sm"
            style={{ animation: "chat-appear 0.5s ease-out 1.8s both", maxWidth: 210 }}
          >
            <p className="text-sm text-[#F8FAFC]">I&apos;d be happy to help! Let me check available slots...</p>
          </div>
        </div>

        {/* ─── Center: Human Agent Avatar ─── */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Avatar circle with glow */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#DE6C33] to-[#F2A339] blur-xl opacity-40" />
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="relative">
              <defs>
                <linearGradient id="avatarGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#DE6C33" />
                  <stop offset="1" stopColor="#F2A339" />
                </linearGradient>
                <linearGradient id="avatarBg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#0F172A" />
                  <stop offset="1" stopColor="#1E293B" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="58" fill="url(#avatarBg)" stroke="url(#avatarGrad)" strokeWidth="2.5" />
              {/* Head */}
              <circle cx="60" cy="42" r="16" fill="url(#avatarGrad)" opacity="0.9" />
              {/* Body / shoulders */}
              <path d="M30 90 C30 70, 42 62, 60 62 C78 62, 90 70, 90 90" fill="url(#avatarGrad)" opacity="0.7" />
              {/* Headset */}
              <path d="M38 38 C38 24, 82 24, 82 38" stroke="#F8FAFC" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <rect x="33" y="34" width="8" height="12" rx="4" fill="#F8FAFC" opacity="0.9" />
              <rect x="79" y="34" width="8" height="12" rx="4" fill="#F8FAFC" opacity="0.9" />
              {/* Mic arm */}
              <path d="M34 44 C30 50, 38 56, 46 54" stroke="#F8FAFC" strokeWidth="2" fill="none" strokeLinecap="round" />
              <circle cx="46" cy="54" r="3" fill="#F8FAFC" opacity="0.9" />
              {/* Active indicator */}
              <circle cx="95" cy="90" r="10" fill="#0F172A" />
              <circle cx="95" cy="90" r="7" fill="#10B981" />
            </svg>
          </div>

          {/* Agent label */}
          <div className="mt-4 rounded-full border border-[#334155]/60 bg-[#0F172A]/80 px-5 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-sm font-medium text-[#F8FAFC]">AI Agent Active</span>
            </div>
          </div>
        </div>

        {/* ─── Right: Voice Waveform ─── */}
        <div className="absolute right-[4%] top-[15%] flex flex-col items-center gap-4 sm:right-[8%]">
          {/* Waveform card */}
          <div
            className="rounded-2xl border border-[#334155] bg-[#0F172A]/90 p-4 backdrop-blur-sm"
            style={{ animation: "chat-appear 0.5s ease-out 0.8s both" }}
          >
            <p className="text-xs text-[#94A3B8] mb-3">Voice Activity</p>
            <div className="flex items-end gap-[3px] h-10">
              {[0.5, 0.8, 0.3, 1, 0.6, 0.9, 0.4, 0.7, 1, 0.5, 0.8, 0.3, 0.6, 0.9, 0.4].map((h, i) => {
                // Deterministic durations to avoid hydration mismatch (no Math.random)
                const durations = [0.72, 0.95, 0.68, 1.1, 0.82, 1.05, 0.75, 0.9, 0.65, 1.0, 0.78, 0.88, 0.7, 1.08, 0.85];
                return (
                  <div
                    key={i}
                    className="w-[3px] rounded-full"
                    style={{
                      height: 40,
                      background: i % 2 === 0 ? "#2E3192" : "#DE6C33",
                      transformOrigin: "bottom",
                      animation: `waveform-bar ${durations[i]}s ease-in-out ${i * 0.05}s infinite`,
                      transform: `scaleY(${h})`,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Languages card */}
          <div
            className="rounded-2xl border border-[#334155] bg-[#0F172A]/90 px-4 py-3 backdrop-blur-sm"
            style={{ animation: "chat-appear 0.5s ease-out 1.4s both" }}
          >
            <p className="text-xs text-[#94A3B8] mb-2">29+ Languages</p>
            <div className="flex gap-1.5">
              {["EN", "ES", "FR", "DE", "HI"].map((lang) => (
                <span key={lang} className="rounded-md bg-[#2E3192]/20 px-2 py-0.5 text-[10px] font-medium text-[#818CF8]">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Floating Stat Cards ─── */}
        <div
          className="absolute left-[6%] bottom-[5%] rounded-xl border border-[#334155]/50 bg-[#0F172A]/80 px-3 py-2 backdrop-blur-sm animate-float hidden sm:block"
        >
          <div className="text-lg font-bold text-[#10B981]">98%</div>
          <div className="text-[10px] text-[#94A3B8]">Satisfaction</div>
        </div>

        <div
          className="absolute right-[6%] bottom-[5%] rounded-xl border border-[#334155]/50 bg-[#0F172A]/80 px-3 py-2 backdrop-blur-sm animate-float-slow hidden sm:block"
        >
          <div className="text-lg font-bold text-[#DE6C33]">&lt; 1s</div>
          <div className="text-[10px] text-[#94A3B8]">Response</div>
        </div>

        <div
          className="absolute left-1/2 bottom-0 -translate-x-1/2 rounded-xl border border-[#334155]/50 bg-[#0F172A]/80 px-3 py-2 backdrop-blur-sm animate-float-delayed hidden sm:block"
        >
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[#2E3192]" />
            <span className="text-xs font-medium text-[#F8FAFC]">24/7 Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Floating accent orbs ── */
function FloatingElements() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-[30%] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#2E3192]/20 to-[#2E3192]/10 blur-3xl animate-blob sm:h-[700px] sm:w-[700px]" />
      <div className="absolute -bottom-[15%] right-[-10%] h-[350px] w-[350px] rounded-full bg-gradient-to-tl from-[#DE6C33]/15 to-[#F2A339]/10 blur-3xl animate-blob [animation-delay:2s]" />
      <div className="absolute -bottom-[15%] left-[-5%] h-[300px] w-[300px] rounded-full bg-gradient-to-tr from-[#2E3192]/10 to-[#00A2C7]/10 blur-3xl animate-blob [animation-delay:4s]" />

      {/* Floating 3D shapes */}
      <div className="absolute top-20 left-[8%] animate-float hidden lg:block">
        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#2E3192] to-[#1a1d5e] shadow-lg shadow-[#2E3192]/30" style={{ transform: "perspective(500px) rotateX(15deg) rotateY(-15deg)" }} />
      </div>
      <div className="absolute top-32 right-[10%] animate-float-slow hidden lg:block">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#DE6C33] to-[#F2A339] shadow-lg shadow-[#DE6C33]/30" style={{ transform: "perspective(500px) rotateX(-10deg) rotateY(20deg)" }} />
      </div>
      <div className="absolute top-[60%] left-[5%] animate-float-delayed hidden lg:block">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#F2A339] to-[#DE6C33] shadow-lg shadow-[#F2A339]/30 rotate-45" />
      </div>
      <div className="absolute top-[55%] right-[7%] animate-float hidden lg:block [animation-delay:1s]">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#00A2C7] to-[#2E3192] shadow-lg shadow-[#00A2C7]/30" style={{ transform: "perspective(500px) rotateX(20deg) rotateY(10deg)" }} />
      </div>

      {/* Small dots */}
      <div className="absolute top-[15%] left-[20%] h-2 w-2 rounded-full bg-[#2E3192] animate-float opacity-60 hidden md:block" />
      <div className="absolute top-[25%] right-[20%] h-3 w-3 rounded-full bg-[#DE6C33] animate-float-slow opacity-50 hidden md:block" />
      <div className="absolute top-[70%] left-[15%] h-2 w-2 rounded-full bg-[#00A2C7] animate-float-delayed opacity-50 hidden md:block" />
      <div className="absolute top-[65%] right-[18%] h-2 w-2 rounded-full bg-[#F2A339] animate-float opacity-40 hidden md:block [animation-delay:3s]" />
    </div>
  );
}

/* ── Stats Counter ── */
function StatsBanner() {
  return (
    <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {[
        { value: "5,000+", label: "Voices Available" },
        { value: "29+", label: "Languages" },
        { value: "17", label: "Industry Domains" },
        { value: "99.9%", label: "Uptime SLA" },
      ].map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden rounded-xl border border-[#334155]/50 bg-[#0F172A]/60 px-4 py-5 text-center backdrop-blur-md"
        >
          <div className="text-2xl font-bold text-[#F8FAFC] sm:text-3xl">{stat.value}</div>
          <div className="mt-1 text-xs text-[#94A3B8] sm:text-sm">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[80vh] sm:min-h-[90vh] flex items-center">
      <FloatingElements />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8 lg:pt-24 w-full">
        <div className="max-w-3xl mx-auto text-center">
          {/* Heading */}
          <h1 className="text-4xl font-extrabold tracking-[-1.2px] text-[#F8FAFC] opacity-0 animate-fade-up sm:text-5xl lg:text-[54px] xl:text-[64px]">
            Build AI Voice Agents That{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-[#DE6C33] to-[#F2A339] bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
                Call, Chat &amp; Convert
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-[#94A3B8] opacity-0 animate-fade-up [animation-delay:0.1s] sm:text-lg lg:text-xl leading-relaxed">
            Create powerful AI voice agents that handle phone calls, web chat, and lead qualification
            &mdash; no code required. Deploy in minutes.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row opacity-0 animate-fade-up [animation-delay:0.2s]">
            <Link
              href="/signup"
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[#DE6C33] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#D64700] sm:w-auto"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#demo"
              className="group flex w-full items-center justify-center gap-2 rounded-full border border-[#334155] px-8 py-4 text-base font-medium text-[#F8FAFC] backdrop-blur-sm transition-colors hover:border-[#94A3B8] hover:bg-white/5 sm:w-auto"
            >
              <Play className="h-4 w-4 transition-transform group-hover:scale-110" />
              Watch Demo
            </Link>
          </div>

          {/* Social proof */}
          <p className="mt-8 text-center text-sm text-[#94A3B8] opacity-0 animate-fade-up [animation-delay:0.3s]">
            No credit card required. Free tier includes 2 agents &amp; 100 conversations/month.
          </p>
        </div>

        {/* Hero Illustration */}
        <div className="mt-12 sm:mt-16">
          <HeroIllustration />
        </div>

        {/* Stats */}
        <StatsBanner />
      </div>
    </section>
  );
}
