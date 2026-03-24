import { BarChart3, TrendingUp, PieChart, Activity, Download, Bell, Eye, Gauge } from "lucide-react";
import { PlatformHero } from "@/components/platform/platform-hero";
import { FeatureGrid } from "@/components/platform/feature-grid";
import { HowItWorksSteps } from "@/components/platform/how-it-works-steps";
import { PlatformCta } from "@/components/platform/platform-cta";

export const metadata = {
  title: "Analytics - Vonex AI",
  description: "Real-time dashboards, call insights, sentiment analysis, and detailed reports for your AI agents.",
};

const features = [
  { icon: Activity, title: "Real-Time Dashboard", description: "Monitor all your agents in real-time. See active calls, ongoing chats, response times, and performance metrics at a glance." },
  { icon: TrendingUp, title: "Call & Chat Insights", description: "Analyze conversation trends, peak hours, popular topics, and customer sentiment over time." },
  { icon: PieChart, title: "Sentiment Analysis", description: "Understand how customers feel during interactions. Track positive, neutral, and negative sentiments across all conversations." },
  { icon: Gauge, title: "Performance Metrics", description: "Measure agent effectiveness with success rates, resolution times, handoff rates, and customer satisfaction scores." },
  { icon: Download, title: "Export Reports", description: "Download detailed reports in CSV or PDF format. Share insights with your team or integrate with your BI tools." },
  { icon: Bell, title: "Smart Alerts", description: "Get notified when metrics drop below thresholds, when agents need attention, or when campaigns finish." },
  { icon: Eye, title: "Conversation Replay", description: "Review full conversation transcripts and call recordings. Understand exactly what happened in every interaction." },
  { icon: BarChart3, title: "Campaign Analytics", description: "Track campaign-level metrics including reach rates, conversion rates, cost per call, and ROI calculations." },
];

const steps = [
  { number: "1", title: "Connect Your Agents", description: "Analytics are automatically enabled for all your agents. No setup required — data starts flowing immediately." },
  { number: "2", title: "Monitor & Analyze", description: "Use the real-time dashboard to track performance. Drill down into specific agents, campaigns, or time periods." },
  { number: "3", title: "Optimize & Improve", description: "Use insights to fine-tune your agents, adjust scripts, and improve customer satisfaction scores." },
];

export default function AnalyticsPage() {
  return (
    <>
      <PlatformHero
        icon={BarChart3}
        title="Powerful"
        highlight="Analytics"
        description="Get real-time insights into every conversation. Track performance, understand sentiment, and optimize your AI agents with data-driven decisions."
        gradient="bg-gradient-to-br from-[#F2A339]/30 to-[#DE6C33]/20"
      />
      <FeatureGrid
        title="Data-Driven Agent Management"
        subtitle="Comprehensive analytics to help you understand and improve every interaction"
        features={features}
      />
      <HowItWorksSteps steps={steps} />
      <PlatformCta
        title="Start Tracking Performance"
        description="Analytics are built-in and free. Create your first agent and see insights immediately."
      />
    </>
  );
}
