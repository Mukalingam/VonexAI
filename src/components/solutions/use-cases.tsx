import { Bot } from "lucide-react";

interface UseCasesProps {
  domainName: string;
  agentTypes: { value: string; label: string }[];
}

export function UseCases({ domainName, agentTypes }: UseCasesProps) {
  const agentDescriptions: Record<string, string> = {
    receptionist: "Handle incoming calls, schedule appointments, and manage front-desk inquiries",
    triage_assistant: "Assess urgency and route inquiries to the right department or specialist",
    follow_up_agent: "Automatically follow up with customers after interactions or purchases",
    sdr_agent: "Qualify leads and schedule demos through outbound conversations",
    lead_qualifier: "Ask qualifying questions and score leads based on your criteria",
    demo_scheduler: "Book product demos and meetings with interested prospects",
    cold_outreach: "Reach out to new prospects with personalized conversations",
    support_agent: "Handle customer support tickets and resolve common issues",
    onboarding_agent: "Guide new customers through setup and product onboarding",
    tutor: "Provide personalized tutoring and educational content delivery",
    property_agent: "Help buyers find properties and schedule viewings",
    concierge: "Assist guests with reservations, recommendations, and services",
    order_support: "Track orders, handle returns, and resolve shipping issues",
    service_advisor: "Schedule service appointments and provide maintenance guidance",
    production_monitor: "Monitor production lines and report status updates",
    account_manager: "Handle account inquiries, transactions, and financial advice",
    legal_intake: "Collect case details and schedule consultations",
    dispatch_agent: "Coordinate deliveries and track shipment status",
    claims_agent: "Process insurance claims and provide policy information",
    booking_agent: "Schedule home service appointments and provide estimates",
    solar_consultant: "Qualify leads for solar installation and schedule assessments",
    travel_agent: "Help plan trips, book accommodations, and provide travel info",
    custom_agent: "Build a fully custom agent tailored to your specific needs",
  };

  return (
    <section className="py-20 border-t border-[#334155]/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Agent Types for <span className="text-[#DE6C33]">{domainName}</span>
          </h2>
          <p className="mt-4 text-[#94A3B8] text-lg">
            Pre-built agent templates optimized for your industry
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {agentTypes.map((agent) => (
            <div
              key={agent.value}
              className="group rounded-2xl border border-[#334155]/50 bg-[#0F172A]/60 p-5 transition-all hover:-translate-y-1 hover:border-[#DE6C33]/30 hover:shadow-lg"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#2E3192]/15 text-[#DE6C33] transition-colors group-hover:bg-[#2E3192]/25">
                <Bot className="h-5 w-5" />
              </div>
              <h3 className="mb-1 font-semibold text-[#F8FAFC]">{agent.label}</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                {agentDescriptions[agent.value] || `Specialized ${agent.label.toLowerCase()} for ${domainName.toLowerCase()}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
