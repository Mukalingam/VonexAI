import { Phone, PhoneIncoming, PhoneOutgoing, BarChart3, Voicemail, Clock, Users, Shuffle } from "lucide-react";
import { PlatformHero } from "@/components/platform/platform-hero";
import { FeatureGrid } from "@/components/platform/feature-grid";
import { HowItWorksSteps } from "@/components/platform/how-it-works-steps";
import { PlatformCta } from "@/components/platform/platform-cta";

export const metadata = {
  title: "AI Phone Calling - Vonex AI",
  description: "Automate inbound and outbound calls with AI. Handle thousands of calls simultaneously with seamless telephony.",
};

const features = [
  { icon: PhoneOutgoing, title: "Outbound Campaigns", description: "Launch AI-powered calling campaigns to reach thousands of leads simultaneously. Set schedules, scripts, and follow-up rules." },
  { icon: PhoneIncoming, title: "Inbound Call Handling", description: "Never miss a call. Your AI agent answers instantly, handles inquiries, books appointments, and routes complex cases." },
  { icon: Shuffle, title: "Smart Call Routing", description: "Automatically route calls based on intent, language, or topic. Transfer to the right human agent when needed." },
  { icon: Voicemail, title: "Voicemail Detection", description: "Intelligently detect voicemails and answering machines. Leave personalized messages or retry at a better time." },
  { icon: BarChart3, title: "Call Analytics", description: "Track call duration, sentiment, outcomes, and conversion rates. Get actionable insights from every conversation." },
  { icon: Clock, title: "Scheduled Calling", description: "Schedule calls at optimal times based on timezone and historical answer rates to maximize connections." },
  { icon: Users, title: "Bulk Campaigns", description: "Upload contact lists, set campaign parameters, and let AI handle thousands of calls with personalized conversations." },
  { icon: Phone, title: "Carrier Integration", description: "Enterprise-grade telephony for reliable call quality. Use your own numbers or provision new ones instantly." },
];

const steps = [
  { number: "1", title: "Connect Your Number", description: "Link your phone account and numbers. Or provision new numbers directly from the Vonex AI dashboard." },
  { number: "2", title: "Configure Call Flows", description: "Set up your AI agent's script, define call objectives, and configure when to transfer to human agents." },
  { number: "3", title: "Launch & Monitor", description: "Start making or receiving calls. Monitor real-time analytics, listen to recordings, and optimize performance." },
];

export default function PhoneCallingPage() {
  return (
    <>
      <PlatformHero
        icon={Phone}
        title="AI-Powered"
        highlight="Phone Calling"
        description="Automate inbound and outbound calls with AI agents that sound human. Handle thousands of concurrent calls with seamless telephony."
        gradient="bg-gradient-to-br from-[#DE6C33]/30 to-[#F2A339]/20"
      />
      <FeatureGrid
        title="Complete Call Automation"
        subtitle="Everything you need to automate your phone operations"
        features={features}
      />
      <HowItWorksSteps steps={steps} />
      <PlatformCta
        title="Automate Your Phone Calls Today"
        description="Connect your phone numbers and start making AI-powered calls in minutes."
      />
    </>
  );
}
