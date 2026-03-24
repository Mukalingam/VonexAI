import { MessageSquare, Code, Paintbrush, Zap, Database, Globe, BarChart3, Users } from "lucide-react";
import { PlatformHero } from "@/components/platform/platform-hero";
import { FeatureGrid } from "@/components/platform/feature-grid";
import { HowItWorksSteps } from "@/components/platform/how-it-works-steps";
import { PlatformCta } from "@/components/platform/platform-cta";

export const metadata = {
  title: "Web Chat Agent - Vonex AI",
  description: "Embed a conversational AI chat agent on your website. Capture leads, answer questions, and support customers 24/7.",
};

const features = [
  { icon: MessageSquare, title: "Conversational AI Chat", description: "Embed a smart chat widget that engages visitors with natural, context-aware conversations powered by your knowledge base." },
  { icon: Paintbrush, title: "Fully Customizable", description: "Match your brand with custom colors, logos, welcome messages, and chat bubble styles. Looks native on any website." },
  { icon: Database, title: "Knowledge Base Powered", description: "Upload documents, URLs, or FAQs. Your chat agent uses your content to provide accurate, relevant answers." },
  { icon: Zap, title: "Lead Capture", description: "Automatically qualify visitors, capture contact info, and push leads to your CRM. Convert more visitors into customers." },
  { icon: Globe, title: "Multi-Language Support", description: "Detect visitor language and respond accordingly. Support 29+ languages for a truly global reach." },
  { icon: Users, title: "Human Handoff", description: "Seamlessly escalate to live agents when the AI detects complex queries or when the visitor requests human help." },
  { icon: Code, title: "Easy Embed", description: "Add a single script tag to your website. Works with any platform — WordPress, Shopify, React, or custom HTML." },
  { icon: BarChart3, title: "Conversation Analytics", description: "Track engagement, common questions, satisfaction scores, and conversion rates from your chat widget." },
];

const steps = [
  { number: "1", title: "Create Chat Agent", description: "Choose your agent type, set the personality, and configure your welcome message and conversation style." },
  { number: "2", title: "Add Knowledge", description: "Upload your documents, paste URLs, or write FAQs. The AI learns your content to answer questions accurately." },
  { number: "3", title: "Embed on Your Site", description: "Copy the embed script and paste it into your website. Your AI chat agent goes live instantly." },
];

export default function WebChatAgentPage() {
  return (
    <>
      <PlatformHero
        icon={MessageSquare}
        title="Intelligent"
        highlight="Web Chat Agent"
        description="Embed a powerful AI chat agent on your website that engages visitors, answers questions, captures leads, and provides 24/7 support."
        gradient="bg-gradient-to-br from-[#00A2C7]/30 to-[#2E3192]/20"
      />
      <FeatureGrid
        title="Smart Chat for Your Website"
        subtitle="Turn every website visitor into an opportunity with AI-powered chat"
        features={features}
      />
      <HowItWorksSteps steps={steps} />
      <PlatformCta
        title="Add AI Chat to Your Website"
        description="Set up in under 5 minutes. No coding required. Start engaging visitors today."
      />
    </>
  );
}
