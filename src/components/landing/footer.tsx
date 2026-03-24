"use client";

import Link from "next/link";
import { VonexLogo } from "@/components/ui/vonex-logo";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Documentation", href: "/docs" },
  ],
  Company: [
    { label: "About", href: "https://iicl.in" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
  Connect: [
    { label: "Twitter", href: "https://twitter.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[#334155]/40 bg-[#0A0A0F]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Link Columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-[#F8FAFC]">
                {category}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#94A3B8] transition-colors hover:text-[#DE6C33]"
                      {...(link.href.startsWith("https://")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="my-8 h-px bg-[#334155]/40" />

        {/* Bottom Row */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Logo */}
          <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
            <div className="rounded-lg bg-white px-3 py-1.5">
              <VonexLogo height={36} />
            </div>
          </Link>

          {/* Copyright */}
          <p className="text-sm text-[#94A3B8]">
            &copy; {new Date().getFullYear()} Vonex AI by IICL. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
