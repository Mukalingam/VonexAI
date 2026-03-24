import { Code2, Webhook, Key, Blocks, FileJson, Gauge, BookOpen, Zap } from "lucide-react";
import { PlatformHero } from "@/components/platform/platform-hero";
import { FeatureGrid } from "@/components/platform/feature-grid";
import { HowItWorksSteps } from "@/components/platform/how-it-works-steps";
import { PlatformCta } from "@/components/platform/platform-cta";

export const metadata = {
  title: "API Access - Vonex AI",
  description: "Full REST API for building custom integrations. Webhooks, SDKs, and developer-friendly documentation.",
};

const features = [
  { icon: FileJson, title: "RESTful API", description: "Complete REST API for managing agents, conversations, calls, and analytics. Build custom workflows and integrations." },
  { icon: Webhook, title: "Webhooks", description: "Get real-time notifications for events like call completions, new messages, sentiment changes, and campaign updates." },
  { icon: Blocks, title: "SDK Support", description: "Use our JavaScript SDK to embed agents in your application. Full TypeScript support with comprehensive type definitions." },
  { icon: Key, title: "API Key Management", description: "Generate and manage API keys with granular permissions. Rotate keys, set expiry dates, and monitor usage." },
  { icon: Gauge, title: "Rate Limiting", description: "Generous rate limits designed for production workloads. Higher limits available for enterprise plans." },
  { icon: BookOpen, title: "Developer Docs", description: "Comprehensive documentation with code examples, quickstart guides, and interactive API explorer." },
  { icon: Zap, title: "Low Latency", description: "Sub-second API response times for critical operations. Globally distributed infrastructure for fast access." },
  { icon: Code2, title: "Custom Integrations", description: "Connect Vonex AI to your CRM, helpdesk, or any tool. Build custom workflows with our flexible API." },
];

const steps = [
  { number: "1", title: "Get Your API Key", description: "Sign up and generate your API key from the dashboard. Each key has configurable permissions and scopes." },
  { number: "2", title: "Explore the Docs", description: "Browse our comprehensive API documentation with examples in JavaScript, Python, cURL, and more." },
  { number: "3", title: "Build & Integrate", description: "Start making API calls to create agents, send messages, initiate calls, and pull analytics data." },
];

export default function APIAccessPage() {
  return (
    <>
      <PlatformHero
        icon={Code2}
        title="Developer"
        highlight="API Access"
        description="Full REST API with webhooks, SDKs, and comprehensive documentation. Build custom integrations and automate your AI agent workflows."
        gradient="bg-gradient-to-br from-[#2E3192]/30 to-[#00A2C7]/20"
      />
      <FeatureGrid
        title="Built for Developers"
        subtitle="Everything you need to integrate Vonex AI into your application"
        features={features}
      />
      <HowItWorksSteps steps={steps} />
      <PlatformCta
        title="Start Building with Our API"
        description="Get your API key and start integrating in minutes. Free tier includes full API access."
      />
    </>
  );
}
