import type { Metadata } from "next";
import { VonexLogo } from "@/components/ui/vonex-logo";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Sign in or create an account for Vonex AI",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0A0A0F] via-[#0F172A] to-[#2E3192]/30 px-4 py-12">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[#2E3192]/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#DE6C33]/8 blur-3xl" />
        <div className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-[#2E3192]/5 blur-2xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
        {/* Logo */}
        <div className="rounded-xl bg-white px-4 py-2">
          <VonexLogo height={48} />
        </div>

        {/* Card container */}
        {children}
      </div>
    </div>
  );
}
