"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Phone,
  MessageSquare,
  BarChart3,
  Code2,
  Shield,
  Bot,
  Building2,
  Briefcase,
  Heart,
  ShoppingCart,
  Home,
  DollarSign,
  FileText,
  BookOpen,
  Video,
  HelpCircle,
  Users,
  Mail,
  Lock,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { VonexLogo } from "@/components/ui/vonex-logo";

/* ── Mega-menu data ── */
interface MenuItem {
  icon: React.ElementType;
  title: string;
  desc: string;
  href: string;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const MENUS: Record<string, MenuGroup[]> = {
  Platform: [
    {
      label: "Products",
      items: [
        { icon: Bot, title: "AI Voice Agent", desc: "Build intelligent voice bots in minutes", href: "/platform/ai-voice-agent" },
        { icon: Phone, title: "Phone Calling", desc: "Outbound & inbound call automation", href: "/platform/phone-calling" },
        { icon: MessageSquare, title: "Web Chat Agent", desc: "Embed conversational AI on your site", href: "/platform/web-chat-agent" },
        { icon: BarChart3, title: "Analytics", desc: "Real-time call insights & metrics", href: "/platform/analytics" },
      ],
    },
    {
      label: "Developers",
      items: [
        { icon: Code2, title: "API Access", desc: "RESTful APIs for full control", href: "/platform/api-access" },
        { icon: Shield, title: "Enterprise Security", desc: "SOC 2, HIPAA-ready compliance", href: "/platform/enterprise-security" },
      ],
    },
  ],
  Solutions: [
    {
      label: "By Industry",
      items: [
        { icon: Home, title: "Real Estate", desc: "Lead qualification & scheduling", href: "/solutions/real_estate" },
        { icon: Shield, title: "Insurance", desc: "Claims intake & policy support", href: "/solutions/insurance" },
        { icon: Briefcase, title: "SaaS & Tech", desc: "Demo scheduling & onboarding", href: "/solutions/ecommerce" },
        { icon: Heart, title: "Healthcare", desc: "Appointment reminders & triage", href: "/solutions/healthcare" },
        { icon: DollarSign, title: "Financial Services", desc: "Account support & verification", href: "/solutions/banking_finance" },
        { icon: ShoppingCart, title: "E-commerce", desc: "Order tracking & product help", href: "/solutions/ecommerce" },
      ],
    },
  ],
  Resources: [
    {
      label: "Learn",
      items: [
        { icon: FileText, title: "Documentation", desc: "Guides, API references & tutorials", href: "/docs" },
        { icon: BookOpen, title: "Blog", desc: "Tips, case studies & updates", href: "/docs" },
        { icon: Video, title: "Webinars", desc: "Live demos & deep-dives", href: "/docs" },
        { icon: HelpCircle, title: "Help Center", desc: "FAQs & troubleshooting", href: "/contact" },
      ],
    },
  ],
  Company: [
    {
      label: "About",
      items: [
        { icon: Building2, title: "About Us", desc: "Our mission & team", href: "/contact" },
        { icon: Users, title: "Careers", desc: "Join the Vonex AI team", href: "/contact" },
        { icon: Mail, title: "Contact", desc: "Get in touch with sales", href: "/contact" },
        { icon: Lock, title: "Privacy & Terms", desc: "Legal & compliance", href: "/privacy" },
      ],
    },
  ],
};

const MENU_KEYS = Object.keys(MENUS);

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close dropdown on scroll
  useEffect(() => {
    const handleScroll = () => setActiveMenu(null);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = (key: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setActiveMenu(key);
  };

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => setActiveMenu(null), 200);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#334155]/40 bg-[#0A0A0F]/80 backdrop-blur-[20px]">
      <nav
        ref={navRef}
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
          <div className="rounded-lg bg-white px-3 py-1.5">
            <VonexLogo height={40} />
          </div>
        </Link>

        {/* Desktop Nav — Mega-menu triggers */}
        <div className="hidden items-center gap-1 lg:flex">
          {MENU_KEYS.map((key) => (
            <div
              key={key}
              className="relative"
              onMouseEnter={() => handleMouseEnter(key)}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:text-white">
                {key}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${
                    activeMenu === key ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown panel */}
              {activeMenu === key && (
                <div
                  className="absolute left-1/2 top-full pt-2 -translate-x-1/2"
                  onMouseEnter={() => handleMouseEnter(key)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="min-w-[380px] rounded-[18px] border border-[#334155] bg-[#0F172A] p-5 shadow-2xl shadow-black/40">
                    {MENUS[key].map((group) => (
                      <div key={group.label} className="mb-4 last:mb-0">
                        <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]/60">
                          {group.label}
                        </p>
                        <div className="grid gap-1">
                          {group.items.map((item) => (
                            <Link
                              key={item.title}
                              href={item.href}
                              onClick={() => setActiveMenu(null)}
                              className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#1E293B]"
                            >
                              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2E3192]/15 text-[#DE6C33] transition-colors group-hover:bg-[#2E3192]/25">
                                <item.icon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {item.title}
                                </p>
                                <p className="text-xs text-[#94A3B8]">
                                  {item.desc}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Flat links */}
          <Link
            href="/#pricing"
            className="rounded-md px-3 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:text-white"
          >
            Pricing
          </Link>
        </div>

        {/* Desktop Right CTAs */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/signin"
            className="rounded-full border border-[#334155] px-5 py-2 text-sm font-medium text-[#F8FAFC] transition-colors hover:border-[#94A3B8] hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="flex items-center gap-1.5 rounded-full bg-[#DE6C33] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#D64700]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex items-center justify-center rounded-lg p-2 text-[#94A3B8] transition-colors hover:text-white lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="border-t border-[#334155]/40 bg-[#0A0A0F]/95 backdrop-blur-lg lg:hidden">
          <div className="mx-auto max-w-7xl space-y-2 px-4 pb-5 pt-3">
            {MENU_KEYS.map((key) => (
              <MobileAccordion key={key} label={key} groups={MENUS[key]} onClose={() => setMobileOpen(false)} />
            ))}

            <Link
              href="/#pricing"
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>

            <div className="flex flex-col gap-2 pt-3 border-t border-[#334155]/40">
              <Link
                href="/signin"
                className="rounded-full border border-[#334155] px-5 py-2.5 text-center text-sm font-medium text-[#F8FAFC] transition-colors hover:border-[#94A3B8]"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="flex items-center justify-center gap-1.5 rounded-full bg-[#DE6C33] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#D64700]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ── Mobile accordion for mega-menu sections ── */
function MobileAccordion({
  label,
  groups,
  onClose,
}: {
  label: string;
  groups: MenuGroup[];
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-white"
        onClick={() => setOpen(!open)}
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="ml-3 space-y-1 pb-2">
          {groups.map((group) =>
            group.items.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-white"
                onClick={onClose}
              >
                <item.icon className="h-4 w-4 text-[#DE6C33]" />
                {item.title}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
