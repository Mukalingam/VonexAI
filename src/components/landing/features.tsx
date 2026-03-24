"use client";

import { useRef, useState } from "react";
import {
  Wand2,
  AudioLines,
  Brain,
  Database,
  MessageSquare,
  BarChart3,
  Phone,
  FileText,
} from "lucide-react";

const features = [
  {
    icon: Wand2,
    title: "No-Code Builder",
    description:
      "Step-by-step wizard to create, configure, and customize voice agents without writing a single line of code.",
    gradient: "from-[#DE6C33] to-[#F2A339]",
    shadowColor: "shadow-[#DE6C33]/20",
    iconBg: "bg-[#DE6C33]/10",
  },
  {
    icon: Phone,
    title: "Phone Calling",
    description:
      "Connect phone numbers for inbound and outbound AI phone calls. Your agents make and receive real calls with full transcripts.",
    gradient: "from-emerald-400 to-emerald-500",
    shadowColor: "shadow-emerald-500/20",
    iconBg: "bg-emerald-500/10",
  },
  {
    icon: AudioLines,
    title: "5,000+ Voices",
    description:
      "Access our premium voice library with natural-sounding voices in 29+ languages and voice cloning support.",
    gradient: "from-[#2E3192] to-[#00A2C7]",
    shadowColor: "shadow-[#2E3192]/20",
    iconBg: "bg-[#2E3192]/10",
  },
  {
    icon: Brain,
    title: "Multi-LLM Support",
    description:
      "Choose from Claude, GPT-4o, Gemini, or DeepSeek for advanced reasoning, context understanding, and intelligent conversations.",
    gradient: "from-[#F2A339] to-[#DE6C33]",
    shadowColor: "shadow-[#F2A339]/20",
    iconBg: "bg-[#F2A339]/10",
  },
  {
    icon: Database,
    title: "Knowledge Base",
    description:
      "Upload documents, URLs, and FAQs to build RAG-powered knowledge bases so your agents give accurate, sourced answers.",
    gradient: "from-rose-400 to-pink-500",
    shadowColor: "shadow-rose-500/20",
    iconBg: "bg-rose-500/10",
  },
  {
    icon: FileText,
    title: "Call Transcripts",
    description:
      "Every phone call is automatically transcribed with speaker labels, sentiment analysis, and call success scoring.",
    gradient: "from-[#00A2C7] to-[#2E3192]",
    shadowColor: "shadow-[#00A2C7]/20",
    iconBg: "bg-[#00A2C7]/10",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Testing",
    description:
      "Chat with your agent in a live sandbox, test edge cases, and iterate on behavior before going live.",
    gradient: "from-sky-400 to-blue-500",
    shadowColor: "shadow-sky-500/20",
    iconBg: "bg-sky-500/10",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track call metrics, conversation analytics, user sentiment, resolution rates, and agent performance.",
    gradient: "from-[#2E3192] to-[#DE6C33]",
    shadowColor: "shadow-[#2E3192]/20",
    iconBg: "bg-[#2E3192]/10",
  },
];

function Feature3DCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    setTransform(
      `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    );
    setGlarePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setTransform("");
    setGlarePos({ x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative rounded-2xl border border-[#334155]/50 bg-[#0F172A]/60 p-6 backdrop-blur-md transition-all duration-300 ease-out hover:shadow-xl ${feature.shadowColor} opacity-0 animate-fade-up`}
      style={{
        transform: transform || undefined,
        animationDelay: `${index * 0.1}s`,
      }}
    >
      {/* Glare effect */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.06) 0%, transparent 60%)`,
        }}
      />

      {/* Gradient top border on hover */}
      <div className={`absolute -top-px left-4 right-4 h-px bg-gradient-to-r ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />

      {/* Icon */}
      <div className="relative">
        <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${feature.iconBg} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
          <feature.icon className="h-7 w-7 text-[#DE6C33]" />
        </div>
      </div>

      {/* Content */}
      <h3 className="mt-5 text-lg font-semibold text-[#F8FAFC]">
        {feature.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
        {feature.description}
      </p>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-[#2E3192]/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[350px] w-[350px] rounded-full bg-[#DE6C33]/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DE6C33]/20 bg-[#DE6C33]/5 px-4 py-1.5 text-sm font-medium text-[#DE6C33]">
            Features
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#F8FAFC] sm:text-4xl lg:text-5xl">
            Everything You Need to Build{" "}
            <span className="bg-gradient-to-r from-[#DE6C33] to-[#F2A339] bg-clip-text text-transparent">
              Voice Agents
            </span>
          </h2>
          <p className="mt-4 text-base text-[#94A3B8] sm:text-lg leading-relaxed">
            From creation to deployment to analytics &mdash; a complete platform for
            building production-ready AI voice agents.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Feature3DCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
