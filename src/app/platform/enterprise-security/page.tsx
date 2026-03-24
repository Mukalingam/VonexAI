import { Shield, Lock, UserCheck, FileSearch, Server, Globe, Key, AlertTriangle } from "lucide-react";
import { PlatformHero } from "@/components/platform/platform-hero";
import { FeatureGrid } from "@/components/platform/feature-grid";
import { HowItWorksSteps } from "@/components/platform/how-it-works-steps";
import { PlatformCta } from "@/components/platform/platform-cta";

export const metadata = {
  title: "Enterprise Security - Vonex AI",
  description: "Enterprise-grade security with SOC 2 compliance, end-to-end encryption, RBAC, and audit logging.",
};

const features = [
  { icon: Shield, title: "SOC 2 Compliant", description: "Our infrastructure meets SOC 2 Type II requirements. Regular third-party audits ensure ongoing compliance." },
  { icon: Lock, title: "End-to-End Encryption", description: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Your conversations and customer data are always protected." },
  { icon: UserCheck, title: "Role-Based Access (RBAC)", description: "Fine-grained permissions for team members. Control who can create agents, view analytics, manage billing, and more." },
  { icon: FileSearch, title: "Audit Logging", description: "Complete audit trail of all actions taken in your account. Track who did what, when, for compliance and security reviews." },
  { icon: Server, title: "Data Residency", description: "Choose where your data is stored. Options for US, EU, and other regions to meet local data sovereignty requirements." },
  { icon: Globe, title: "HIPAA Ready", description: "For healthcare customers, we offer HIPAA-compliant configurations with BAA agreements and additional safeguards." },
  { icon: Key, title: "SSO & MFA", description: "Enterprise SSO via SAML/OIDC for seamless authentication. Multi-factor authentication for additional security." },
  { icon: AlertTriangle, title: "Threat Detection", description: "Automated monitoring for suspicious activity, unusual API patterns, and potential security threats with instant alerts." },
];

const steps = [
  { number: "1", title: "Security Assessment", description: "Work with our security team to review your requirements, compliance needs, and data handling policies." },
  { number: "2", title: "Custom Configuration", description: "We configure your instance with the right security controls: SSO, RBAC, encryption settings, and data residency." },
  { number: "3", title: "Ongoing Compliance", description: "Regular security audits, compliance reports, and dedicated security support to keep you protected." },
];

export default function EnterpriseSecurityPage() {
  return (
    <>
      <PlatformHero
        icon={Shield}
        title="Enterprise-Grade"
        highlight="Security"
        description="Bank-level security for your AI agents. SOC 2 compliant, end-to-end encrypted, with RBAC, audit logs, and HIPAA-ready configurations."
        gradient="bg-gradient-to-br from-[#10B981]/20 to-[#2E3192]/20"
      />
      <FeatureGrid
        title="Security You Can Trust"
        subtitle="Built from the ground up with enterprise security requirements in mind"
        features={features}
      />
      <HowItWorksSteps steps={steps} />
      <PlatformCta
        title="Secure Your AI Operations"
        description="Talk to our security team about your enterprise requirements and compliance needs."
      />
    </>
  );
}
