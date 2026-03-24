import { Bot, Mic, Globe, Brain, Zap, Users, Headphones, Settings } from "lucide-react";
import { PlatformHero } from "@/components/platform/platform-hero";
import { FeatureGrid } from "@/components/platform/feature-grid";
import { HowItWorksSteps } from "@/components/platform/how-it-works-steps";
import { PlatformCta } from "@/components/platform/platform-cta";

export const metadata = {
  title: "AI Voice Agent - Vonex AI",
  description: "Build human-like AI voice agents that handle calls, qualify leads, and convert customers 24/7.",
};

const features = [
  { icon: Mic, title: "Natural Conversations", description: "Powered by advanced language models, your AI agent speaks naturally with human-like intonation, pauses, and empathy." },
  { icon: Globe, title: "29+ Languages", description: "Deploy agents that speak your customers' language. Support for English, Spanish, Hindi, French, German, and 24+ more." },
  { icon: Brain, title: "Custom Personas", description: "Define your agent's personality, knowledge base, and conversation style to match your brand perfectly." },
  { icon: Zap, title: "Real-Time Learning", description: "Your agent improves over time by learning from conversations, getting smarter with every interaction." },
  { icon: Users, title: "Warm Handoffs", description: "Seamlessly transfer to human agents when needed, with full context passed along for a smooth experience." },
  { icon: Headphones, title: "5,000+ Voices", description: "Choose from thousands of premium AI voices across different accents, ages, and speaking styles." },
  { icon: Settings, title: "No-Code Builder", description: "Build and customize your AI voice agent through an intuitive interface — no programming required." },
  { icon: Bot, title: "Domain Expertise", description: "Pre-built templates for 17 industries including healthcare, real estate, sales, insurance, and more." },
];

const steps = [
  { number: "1", title: "Create Your Agent", description: "Choose a template or start from scratch. Define your agent's name, persona, language, and voice." },
  { number: "2", title: "Train & Configure", description: "Add your knowledge base, set conversation flows, define when to transfer to humans, and customize responses." },
  { number: "3", title: "Deploy Everywhere", description: "Launch on your website as a chat widget, connect phone numbers for calls, or embed via API." },
];

export default function AIVoiceAgentPage() {
  return (
    <>
      <PlatformHero
        icon={Bot}
        title="Human-Like"
        highlight="AI Voice Agents"
        description="Build intelligent voice agents that handle customer calls, qualify leads, and provide 24/7 support — with natural, human-like conversations."
        gradient="bg-gradient-to-br from-[#2E3192]/30 to-[#DE6C33]/20"
      />
      <FeatureGrid
        title="Everything You Need"
        subtitle="Build, deploy, and manage AI voice agents with powerful features"
        features={features}
      />
      <HowItWorksSteps steps={steps} />
      <PlatformCta
        title="Ready to Build Your AI Agent?"
        description="Start free with 2 agents and 100 conversations per month. No credit card required."
      />
    </>
  );
}
