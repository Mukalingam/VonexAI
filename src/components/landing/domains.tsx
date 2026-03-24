"use client";

import Link from "next/link";
import {
  Stethoscope,
  TrendingUp,
  Headphones,
  GraduationCap,
  Building,
  Hotel,
  ShoppingCart,
  Settings,
  Car,
  Factory,
  Landmark,
  Scale,
  Truck,
  Shield,
  Wrench,
  Sun,
  Plane,
} from "lucide-react";

/* ── Industry-Specific Vector Illustrations ── */

function HealthcareIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16">
      <circle cx="40" cy="40" r="36" fill="#EEF2FF" />
      {/* Stethoscope */}
      <path d="M30 24 C30 18, 50 18, 50 24 L50 38 C50 48, 40 52, 40 52 C40 52, 30 48, 30 38 Z" stroke="#2E3192" strokeWidth="2.5" fill="none" />
      <circle cx="40" cy="54" r="4" fill="#6366F1" />
      <circle cx="40" cy="54" r="2" fill="#2E3192" />
      {/* Heart monitor line */}
      <path d="M18 44 L28 44 L31 36 L35 52 L39 40 L42 48 L45 44 L62 44" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Small cross */}
      <rect x="54" y="22" width="10" height="10" rx="2" fill="#C7D2FE" />
      <path d="M57 25 L61 25 M59 23 L59 29" stroke="#2E3192" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SalesIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16">
      <circle cx="40" cy="40" r="36" fill="#EEF2FF" />
      {/* Chart bars */}
      <rect x="18" y="48" width="8" height="14" rx="2" fill="#C7D2FE" />
      <rect x="29" y="40" width="8" height="22" rx="2" fill="#A5B4FC" />
      <rect x="40" y="32" width="8" height="30" rx="2" fill="#818CF8" />
      <rect x="51" y="24" width="8" height="38" rx="2" fill="#6366F1" />
      {/* Trend arrow */}
      <path d="M20 46 L34 38 L44 30 L56 22" stroke="#2E3192" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M50 22 L56 22 L56 28" stroke="#2E3192" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Dollar sign */}
      <circle cx="63" cy="20" r="6" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
      <text x="63" y="23" textAnchor="middle" fill="#6366F1" fontSize="9" fontWeight="bold">$</text>
    </svg>
  );
}

function SupportIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16">
      <circle cx="40" cy="40" r="36" fill="#FFF7ED" />
      {/* Headset band */}
      <path d="M22 40 C22 26, 58 26, 58 40" stroke="#F97316" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Left ear cup */}
      <rect x="16" y="36" width="10" height="14" rx="5" fill="#FB923C" />
      <rect x="18" y="38" width="6" height="10" rx="3" fill="#F97316" />
      {/* Right ear cup */}
      <rect x="54" y="36" width="10" height="14" rx="5" fill="#FB923C" />
      <rect x="56" y="38" width="6" height="10" rx="3" fill="#F97316" />
      {/* Mic */}
      <path d="M20 50 C20 56, 28 60, 34 60" stroke="#F97316" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="34" cy="60" r="3" fill="#FB923C" />
      {/* Sound waves */}
      <path d="M62 34 C65 37, 65 43, 62 46" stroke="#FDBA74" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M66 30 C71 35, 71 45, 66 50" stroke="#FED7AA" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function EducationIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16">
      <circle cx="40" cy="40" r="36" fill="#FEF3C7" />
      {/* Open book */}
      <path d="M20 52 L40 48 L60 52 L60 28 L40 24 L20 28 Z" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
      <path d="M40 24 L40 48" stroke="#D97706" strokeWidth="1.5" />
      {/* Book pages */}
      <path d="M24 30 L38 27" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M24 34 L38 31" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M24 38 L38 35" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M42 27 L56 30" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M42 31 L56 34" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      {/* Graduation cap */}
      <path d="M30 18 L40 14 L50 18 L40 22 Z" fill="#D97706" />
      <path d="M40 22 L40 18" stroke="#B45309" strokeWidth="1" />
      <path d="M50 18 L50 24" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="50" cy="25" r="1.5" fill="#D97706" />
    </svg>
  );
}

function RealEstateIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16">
      <circle cx="40" cy="40" r="36" fill="#F0FDF4" />
      {/* House */}
      <path d="M20 40 L40 22 L60 40" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="24" y="40" width="32" height="20" rx="1" fill="#A7F3D0" stroke="#059669" strokeWidth="1.5" />
      {/* Door */}
      <rect x="35" y="48" width="10" height="12" rx="1" fill="#059669" />
      <circle cx="43" cy="55" r="1" fill="#A7F3D0" />
      {/* Windows */}
      <rect x="27" y="43" width="6" height="6" rx="1" fill="#ECFDF5" stroke="#059669" strokeWidth="1" />
      <rect x="47" y="43" width="6" height="6" rx="1" fill="#ECFDF5" stroke="#059669" strokeWidth="1" />
      {/* Key */}
      <circle cx="62" cy="24" r="5" stroke="#2E3192" strokeWidth="1.5" fill="none" />
      <path d="M62 29 L62 36 L60 36 M62 33 L60 33" stroke="#2E3192" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HospitalityIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16">
      <circle cx="40" cy="40" r="36" fill="#FDF2F8" />
      {/* Hotel bell base */}
      <rect x="22" y="52" width="36" height="4" rx="2" fill="#DB2777" />
      {/* Bell dome */}
      <path d="M26 52 C26 36, 54 36, 54 52" fill="#F9A8D4" stroke="#EC4899" strokeWidth="1.5" />
      {/* Bell button */}
      <circle cx="40" cy="36" r="3" fill="#EC4899" />
      <rect x="39" y="30" width="2" height="6" rx="1" fill="#DB2777" />
      {/* Sound ring */}
      <path d="M56 42 C59 40, 59 36, 56 34" stroke="#F9A8D4" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M60 44 C64 40, 64 34, 60 30" stroke="#FBCFE8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Star */}
      <path d="M20 24 L22 20 L24 24 L20.5 21.5 L23.5 21.5 Z" fill="#F59E0B" />
      <path d="M58 20 L60 16 L62 20 L58.5 17.5 L61.5 17.5 Z" fill="#F59E0B" />
    </svg>
  );
}

function EcommerceIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16">
      <circle cx="40" cy="40" r="36" fill="#EFF6FF" />
      {/* Shopping cart body */}
      <path d="M18 24 L24 24 L32 48 L56 48 L62 32 L28 32" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Cart wheels */}
      <circle cx="35" cy="54" r="3" fill="#3B82F6" />
      <circle cx="53" cy="54" r="3" fill="#3B82F6" />
      {/* Items in cart */}
      <rect x="34" y="35" width="8" height="10" rx="1.5" fill="#BFDBFE" stroke="#60A5FA" strokeWidth="1" />
      <rect x="44" y="37" width="8" height="8" rx="1.5" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1" />
      {/* Gift box */}
      <rect x="54" y="18" width="12" height="10" rx="2" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.5" />
      <path d="M60 18 L60 28 M54 22 L66 22" stroke="#3B82F6" strokeWidth="1.5" />
      <path d="M57 18 C58 14, 60 14, 60 18 M63 18 C62 14, 60 14, 60 18" stroke="#60A5FA" strokeWidth="1" fill="none" />
    </svg>
  );
}

function AutomobileIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16">
      <circle cx="40" cy="40" r="36" fill="#F0F9FF" />
      {/* Car body */}
      <path d="M14 48 L18 36 L28 28 L52 28 L62 36 L66 48 Z" fill="#BAE6FD" stroke="#0EA5E9" strokeWidth="1.5" />
      {/* Car roof */}
      <path d="M28 28 L32 18 L48 18 L52 28" fill="#7DD3FC" stroke="#0EA5E9" strokeWidth="1.5" />
      {/* Windows */}
      <path d="M30 28 L33 20 L39 20 L39 28" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1" />
      <path d="M41 28 L41 20 L47 20 L50 28" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1" />
      {/* Wheels */}
      <circle cx="25" cy="50" r="6" fill="#1E293B" />
      <circle cx="25" cy="50" r="3" fill="#64748B" />
      <circle cx="55" cy="50" r="6" fill="#1E293B" />
      <circle cx="55" cy="50" r="3" fill="#64748B" />
      {/* Headlight */}
      <rect x="63" y="40" width="4" height="4" rx="1" fill="#FDE68A" />
      {/* Wrench */}
      <path d="M60 20 L66 14" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="20" r="3" stroke="#0EA5E9" strokeWidth="1.5" fill="none" />
      <path d="M66 14 L68 12 L70 14 L68 16 Z" fill="#0EA5E9" />
    </svg>
  );
}

function ManufacturingIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16">
      <circle cx="40" cy="40" r="36" fill="#FFF7ED" />
      {/* Factory building */}
      <rect x="14" y="36" width="20" height="24" rx="1" fill="#FED7AA" stroke="#EA580C" strokeWidth="1.5" />
      {/* Factory roof zigzag */}
      <path d="M14 36 L24 24 L34 36 L44 24 L54 36" fill="#FDBA74" stroke="#EA580C" strokeWidth="1.5" />
      {/* Chimney */}
      <rect x="18" y="20" width="6" height="16" rx="1" fill="#F97316" />
      {/* Smoke puffs */}
      <circle cx="21" cy="16" r="3" fill="#FED7AA" opacity="0.7" />
      <circle cx="24" cy="12" r="2.5" fill="#FED7AA" opacity="0.5" />
      <circle cx="20" cy="10" r="2" fill="#FED7AA" opacity="0.3" />
      {/* Windows */}
      <rect x="17" y="42" width="5" height="5" rx="1" fill="#FFF7ED" />
      <rect x="25" y="42" width="5" height="5" rx="1" fill="#FFF7ED" />
      {/* Door */}
      <rect x="20" y="52" width="8" height="8" rx="1" fill="#EA580C" />
      {/* Gear */}
      <circle cx="56" cy="44" r="8" stroke="#EA580C" strokeWidth="2" fill="none" />
      <circle cx="56" cy="44" r="3" fill="#F97316" />
      <path d="M56 34 L56 38 M56 50 L56 54 M46 44 L50 44 M62 44 L66 44 M49 37 L52 40 M60 48 L63 51 M49 51 L52 48 M60 40 L63 37" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BankingIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16">
      <circle cx="40" cy="40" r="36" fill="#ECFDF5" />
      {/* Bank building roof */}
      <path d="M16 32 L40 16 L64 32" fill="#A7F3D0" stroke="#059669" strokeWidth="1.5" />
      <rect x="18" y="32" width="44" height="4" rx="1" fill="#059669" />
      {/* Pillars */}
      <rect x="22" y="36" width="4" height="18" rx="1" fill="#6EE7B7" stroke="#059669" strokeWidth="1" />
      <rect x="32" y="36" width="4" height="18" rx="1" fill="#6EE7B7" stroke="#059669" strokeWidth="1" />
      <rect x="44" y="36" width="4" height="18" rx="1" fill="#6EE7B7" stroke="#059669" strokeWidth="1" />
      <rect x="54" y="36" width="4" height="18" rx="1" fill="#6EE7B7" stroke="#059669" strokeWidth="1" />
      {/* Base */}
      <rect x="18" y="54" width="44" height="4" rx="1" fill="#059669" />
      {/* Coin stack */}
      <ellipse cx="64" cy="24" rx="6" ry="2.5" fill="#FDE68A" stroke="#D97706" strokeWidth="1" />
      <rect x="58" y="20" width="12" height="4" fill="#FDE68A" stroke="#D97706" strokeWidth="1" />
      <ellipse cx="64" cy="20" rx="6" ry="2.5" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
    </svg>
  );
}

function LegalIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16">
      <circle cx="40" cy="40" r="36" fill="#F5F3FF" />
      {/* Scale beam */}
      <rect x="38" y="18" width="4" height="34" rx="1" fill="#8B5CF6" />
      <path d="M18 28 L62 28" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
      {/* Left pan */}
      <path d="M14 28 L22 28 L18 40 Z" fill="#C4B5FD" stroke="#7C3AED" strokeWidth="1.5" />
      <path d="M12 40 C12 42, 24 42, 24 40" stroke="#7C3AED" strokeWidth="1.5" fill="#DDD6FE" />
      {/* Right pan */}
      <path d="M58 28 L66 28 L62 40 Z" fill="#C4B5FD" stroke="#7C3AED" strokeWidth="1.5" />
      <path d="M56 40 C56 42, 68 42, 68 40" stroke="#7C3AED" strokeWidth="1.5" fill="#DDD6FE" />
      {/* Base */}
      <rect x="30" y="52" width="20" height="4" rx="2" fill="#8B5CF6" />
      <path d="M36 52 L44 52 L42 48 L38 48 Z" fill="#7C3AED" />
      {/* Gavel */}
      <rect x="56" y="50" width="12" height="5" rx="2" fill="#A78BFA" transform="rotate(-30 62 52)" />
      <rect x="60" y="48" width="3" height="10" rx="1" fill="#7C3AED" transform="rotate(-30 62 52)" />
    </svg>
  );
}

function LogisticsIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16">
      <circle cx="40" cy="40" r="36" fill="#FEF2F2" />
      {/* Truck body */}
      <rect x="10" y="34" width="34" height="18" rx="2" fill="#FECACA" stroke="#DC2626" strokeWidth="1.5" />
      {/* Truck cab */}
      <path d="M44 34 L56 34 L62 42 L62 52 L44 52 Z" fill="#FCA5A5" stroke="#DC2626" strokeWidth="1.5" />
      {/* Cab window */}
      <path d="M46 36 L54 36 L58 42 L46 42 Z" fill="#FEF2F2" stroke="#EF4444" strokeWidth="1" />
      {/* Wheels */}
      <circle cx="22" cy="54" r="5" fill="#1E293B" />
      <circle cx="22" cy="54" r="2.5" fill="#64748B" />
      <circle cx="54" cy="54" r="5" fill="#1E293B" />
      <circle cx="54" cy="54" r="2.5" fill="#64748B" />
      {/* Route line */}
      <path d="M16 24 L26 18 L40 22 L54 16 L64 20" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" fill="none" />
      {/* Location pin */}
      <circle cx="64" cy="18" r="3" fill="#DC2626" />
      <circle cx="64" cy="18" r="1.5" fill="#FEF2F2" />
    </svg>
  );
}

function InsuranceIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16">
      <circle cx="40" cy="40" r="36" fill="#F0FDF4" />
      {/* Shield */}
      <path d="M40 18 L56 26 L56 40 C56 52, 40 60, 40 60 C40 60, 24 52, 24 40 L24 26 Z" stroke="#16A34A" strokeWidth="2.5" fill="#DCFCE7" />
      {/* Checkmark */}
      <path d="M32 40 L38 46 L50 34" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Small document */}
      <rect x="54" y="48" width="12" height="16" rx="2" fill="#BBF7D0" stroke="#16A34A" strokeWidth="1" />
      <rect x="57" y="52" width="6" height="1.5" rx="0.75" fill="#16A34A" opacity="0.4" />
      <rect x="57" y="56" width="4" height="1.5" rx="0.75" fill="#16A34A" opacity="0.4" />
    </svg>
  );
}

function HomeServicesIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16">
      <circle cx="40" cy="40" r="36" fill="#FFF7ED" />
      {/* House */}
      <path d="M20 40 L40 22 L60 40" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="26" y="40" width="28" height="20" rx="1" fill="#FED7AA" stroke="#EA580C" strokeWidth="2" />
      {/* Door */}
      <rect x="36" y="48" width="8" height="12" rx="1" fill="#FDBA74" stroke="#EA580C" strokeWidth="1.5" />
      <circle cx="42" cy="54" r="1" fill="#EA580C" />
      {/* Wrench */}
      <path d="M54 20 L58 24 L50 32 L46 28 Z" fill="#FB923C" stroke="#EA580C" strokeWidth="1.5" />
      <circle cx="56" cy="22" r="4" stroke="#EA580C" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function SolarIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16">
      <circle cx="40" cy="40" r="36" fill="#FFFBEB" />
      {/* Sun */}
      <circle cx="40" cy="30" r="10" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" />
      {/* Sun rays */}
      <path d="M40 16 L40 12 M40 44 L40 48 M26 30 L22 30 M54 30 L58 30 M30 20 L27 17 M50 20 L53 17 M30 40 L27 43 M50 40 L53 43" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      {/* Solar panel */}
      <path d="M22 52 L34 42 L46 42 L58 52 Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      <path d="M28 47 L52 47 M34 42 L28 52 M40 42 L40 52 M46 42 L52 52" stroke="#F59E0B" strokeWidth="1" opacity="0.5" />
      {/* Lightning bolt */}
      <path d="M60 54 L56 60 L58 60 L54 66" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function TravelIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16">
      <circle cx="40" cy="40" r="36" fill="#EFF6FF" />
      {/* Airplane */}
      <path d="M20 44 L36 36 L40 24 L44 36 L60 44 L44 46 L42 58 L40 48 L38 58 L36 46 Z" fill="#BFDBFE" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" />
      {/* Globe arc */}
      <path d="M18 56 C28 50, 52 50, 62 56" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
      {/* Location pin */}
      <circle cx="58" cy="28" r="6" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.5" />
      <circle cx="58" cy="27" r="2" fill="#3B82F6" />
      <path d="M58 34 L58 38" stroke="#3B82F6" strokeWidth="1.5" />
    </svg>
  );
}

function CustomIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16">
      <circle cx="40" cy="40" r="36" fill="#F5F3FF" />
      {/* Main gear */}
      <circle cx="34" cy="38" r="10" stroke="#8B5CF6" strokeWidth="2" fill="none" />
      <circle cx="34" cy="38" r="4" fill="#A78BFA" />
      <path d="M34 26 L34 30 M34 46 L34 50 M22 38 L26 38 M42 38 L46 38 M26 30 L29 33 M39 43 L42 46 M26 46 L29 43 M39 33 L42 30" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
      {/* Puzzle piece */}
      <path d="M48 24 L60 24 C60 24, 58 28, 60 30 C62 28, 66 28, 66 30 L66 42 C66 42, 62 40, 60 42 C62 44, 60 48, 60 48 L48 48 C48 48, 50 44, 48 42 C46 44, 42 42, 44 40 Z" fill="#C4B5FD" stroke="#7C3AED" strokeWidth="1.5" />
      {/* Small sparkle */}
      <path d="M18 20 L20 16 L22 20 L20 24 Z" fill="#A78BFA" opacity="0.6" />
      <path d="M60 54 L62 50 L64 54 L62 58 Z" fill="#A78BFA" opacity="0.6" />
    </svg>
  );
}

const domains = [
  {
    slug: "healthcare",
    icon: Stethoscope,
    illustration: HealthcareIllustration,
    name: "Healthcare",
    description:
      "Appointment scheduling, patient intake, symptom triage, and medication reminders.",
    gradient: "from-indigo-500 to-indigo-600",
    border: "hover:border-indigo-500/30",
  },
  {
    slug: "sales",
    icon: TrendingUp,
    illustration: SalesIllustration,
    name: "Sales",
    description:
      "Lead qualification, appointment booking, product demos, and follow-up calls.",
    gradient: "from-indigo-500 to-blue-600",
    border: "hover:border-indigo-500/30",
  },
  {
    slug: "customer_support",
    icon: Headphones,
    illustration: SupportIllustration,
    name: "Customer Support",
    description:
      "24/7 help desk, ticket creation, FAQ resolution, and escalation routing.",
    gradient: "from-orange-500 to-amber-600",
    border: "hover:border-orange-500/30",
  },
  {
    slug: "education",
    icon: GraduationCap,
    illustration: EducationIllustration,
    name: "Education",
    description:
      "Tutoring assistance, enrollment support, campus info, and student guidance.",
    gradient: "from-amber-500 to-yellow-600",
    border: "hover:border-amber-500/30",
  },
  {
    slug: "real_estate",
    icon: Building,
    illustration: RealEstateIllustration,
    name: "Real Estate",
    description:
      "Property inquiries, showing scheduling, market updates, and lead capture.",
    gradient: "from-green-500 to-indigo-600",
    border: "hover:border-green-500/30",
  },
  {
    slug: "hospitality",
    icon: Hotel,
    illustration: HospitalityIllustration,
    name: "Hospitality",
    description:
      "Reservation management, concierge services, room service, and guest support.",
    gradient: "from-pink-500 to-rose-600",
    border: "hover:border-pink-500/30",
  },
  {
    slug: "ecommerce",
    icon: ShoppingCart,
    illustration: EcommerceIllustration,
    name: "E-Commerce",
    description:
      "Order tracking, product recommendations, returns processing, and cart recovery.",
    gradient: "from-blue-500 to-cyan-600",
    border: "hover:border-blue-500/30",
  },
  {
    slug: "automobile",
    icon: Car,
    illustration: AutomobileIllustration,
    name: "Automobile",
    description:
      "Vehicle inquiries, service scheduling, parts availability, and warranty support.",
    gradient: "from-sky-500 to-blue-600",
    border: "hover:border-sky-500/30",
  },
  {
    slug: "manufacturing",
    icon: Factory,
    illustration: ManufacturingIllustration,
    name: "Manufacturing",
    description:
      "Production scheduling, quality control, inventory management, and equipment support.",
    gradient: "from-orange-500 to-red-600",
    border: "hover:border-orange-500/30",
  },
  {
    slug: "banking",
    icon: Landmark,
    illustration: BankingIllustration,
    name: "Banking & Finance",
    description:
      "Account inquiries, loan guidance, fraud alerts, and financial product support.",
    gradient: "from-emerald-500 to-green-600",
    border: "hover:border-emerald-500/30",
  },
  {
    slug: "legal",
    icon: Scale,
    illustration: LegalIllustration,
    name: "Legal",
    description:
      "Legal inquiries, case status updates, document guidance, and consultation scheduling.",
    gradient: "from-purple-500 to-indigo-600",
    border: "hover:border-purple-500/30",
  },
  {
    slug: "logistics",
    icon: Truck,
    illustration: LogisticsIllustration,
    name: "Logistics",
    description:
      "Shipment tracking, dispatch coordination, delivery updates, and route support.",
    gradient: "from-red-500 to-rose-600",
    border: "hover:border-red-500/30",
  },
  {
    slug: "insurance",
    icon: Shield,
    illustration: InsuranceIllustration,
    name: "Insurance",
    description:
      "Claims intake, policy renewals, quote generation, coverage inquiries, and risk assessment.",
    gradient: "from-green-500 to-emerald-600",
    border: "hover:border-green-500/30",
  },
  {
    slug: "home_services",
    icon: Wrench,
    illustration: HomeServicesIllustration,
    name: "Home Services",
    description:
      "Service requests, emergency triage, technician scheduling, and maintenance plans.",
    gradient: "from-orange-500 to-amber-600",
    border: "hover:border-orange-500/30",
  },
  {
    slug: "solar_energy",
    icon: Sun,
    illustration: SolarIllustration,
    name: "Solar & Energy",
    description:
      "Lead qualification, site assessments, installation scheduling, and rebate info.",
    gradient: "from-yellow-500 to-amber-600",
    border: "hover:border-yellow-500/30",
  },
  {
    slug: "travel_tourism",
    icon: Plane,
    illustration: TravelIllustration,
    name: "Travel & Tourism",
    description:
      "Booking assistance, itinerary changes, travel insurance, and destination info.",
    gradient: "from-blue-500 to-indigo-600",
    border: "hover:border-blue-500/30",
  },
  {
    slug: "custom",
    icon: Settings,
    illustration: CustomIllustration,
    name: "Custom",
    description:
      "Build a fully tailored voice agent for any industry or use case you can imagine.",
    gradient: "from-violet-500 to-purple-600",
    border: "hover:border-violet-500/30",
  },
];

export function Domains() {
  return (
    <section id="domains" className="relative py-20 sm:py-28">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F172A]/30 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#2E3192]/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DE6C33]/20 bg-[#DE6C33]/5 px-4 py-1.5 text-sm font-medium text-[#DE6C33]">
            Use Cases
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#F8FAFC] sm:text-4xl lg:text-5xl">
            Voice Agents for{" "}
            <span className="bg-gradient-to-r from-[#DE6C33] to-[#F2A339] bg-clip-text text-transparent">
              Every Industry
            </span>
          </h2>
          <p className="mt-4 text-base text-[#94A3B8] sm:text-lg leading-relaxed">
            Pre-built templates and domain-specific knowledge bases to get you
            started in minutes.
          </p>
        </div>

        {/* Domain Grid */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {domains.map((domain, index) => (
            <Link
              key={domain.name}
              href={`/solutions/${domain.slug}`}
              className={`group relative overflow-hidden rounded-2xl border border-[#334155]/50 bg-[#0F172A]/60 backdrop-blur-sm p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-[#DE6C33]/30 opacity-0 animate-fade-up`}
              style={{
                animationDelay: `${index * 0.08}s`,
              }}
            >
              {/* Gradient background on hover */}
              <div className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br ${domain.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-[0.06]`} />

              <div className="relative">
                {/* Illustration */}
                <div className="transition-transform duration-300 group-hover:scale-105">
                  <domain.illustration />
                </div>

                {/* Content */}
                <h3 className="mt-3 text-base font-semibold text-[#F8FAFC]">
                  {domain.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#94A3B8]">
                  {domain.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
