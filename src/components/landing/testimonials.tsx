"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Vonex AI replaced our entire call center IVR system in under a week. Our patient satisfaction scores jumped 40% almost overnight.",
    name: "Sarah Chen",
    role: "CTO",
    company: "HealthFirst",
    initials: "SC",
    rating: 5,
    color: "bg-[#2E3192]/15 text-[#DE6C33]",
  },
  {
    quote:
      "We deployed a sales qualification agent in 30 minutes. It books more demos than our junior SDRs and works around the clock.",
    name: "Marcus Johnson",
    role: "VP of Sales",
    company: "TechCorp",
    initials: "MJ",
    rating: 5,
    color: "bg-[#DE6C33]/15 text-[#F2A339]",
  },
  {
    quote:
      "The knowledge base feature is incredible. Our support agent answers complex product questions with 95% accuracy from day one.",
    name: "Priya Patel",
    role: "Head of Support",
    company: "ShopEasy",
    initials: "PP",
    rating: 5,
    color: "bg-[#F2A339]/15 text-[#DE6C33]",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-20 sm:py-28">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 h-[350px] w-[350px] rounded-full bg-[#2E3192]/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-[#DE6C33]/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2E3192]/20 bg-[#2E3192]/5 px-4 py-1.5 text-sm font-medium text-[#DE6C33]">
            Testimonials
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#F8FAFC] sm:text-4xl lg:text-5xl">
            Loved by{" "}
            <span className="bg-gradient-to-r from-[#DE6C33] to-[#F2A339] bg-clip-text text-transparent">
              Teams Everywhere
            </span>
          </h2>
          <p className="mt-4 text-base text-[#94A3B8] sm:text-lg leading-relaxed">
            See what businesses are saying about Vonex AI.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="group relative rounded-2xl border border-[#334155]/50 bg-[#0F172A]/60 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl opacity-0 animate-fade-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Quote icon */}
              <Quote className="h-8 w-8 text-[#2E3192]/30" />

              {/* Stars */}
              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-[#F2A339] text-[#F2A339]"
                  />
                ))}
              </div>

              {/* Quote text */}
              <p className="mt-4 text-sm leading-relaxed text-[#F8FAFC]">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${testimonial.color}`}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#F8FAFC]">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    {testimonial.role} @ {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
