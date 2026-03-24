import { notFound } from "next/navigation";
import { DOMAINS } from "@/lib/domains";
import { SolutionHero } from "@/components/solutions/solution-hero";
import { UseCases } from "@/components/solutions/use-cases";
import { SolutionDemo } from "@/components/solutions/solution-demo";
import { SolutionCta } from "@/components/solutions/solution-cta";

// Generate static pages for all domains
export function generateStaticParams() {
  return DOMAINS.map((d) => ({ domain: d.id }));
}

// Domain-specific gradient colors
const DOMAIN_GRADIENTS: Record<string, string> = {
  healthcare: "bg-gradient-to-br from-indigo-500/30 to-indigo-600/20",
  sales: "bg-gradient-to-br from-indigo-500/30 to-blue-600/20",
  customer_support: "bg-gradient-to-br from-orange-500/30 to-amber-600/20",
  education: "bg-gradient-to-br from-amber-500/30 to-yellow-600/20",
  real_estate: "bg-gradient-to-br from-green-500/30 to-indigo-600/20",
  hospitality: "bg-gradient-to-br from-pink-500/30 to-rose-600/20",
  ecommerce: "bg-gradient-to-br from-blue-500/30 to-cyan-600/20",
  automobile: "bg-gradient-to-br from-sky-500/30 to-blue-600/20",
  manufacturing: "bg-gradient-to-br from-orange-500/30 to-red-600/20",
  banking: "bg-gradient-to-br from-emerald-500/30 to-green-600/20",
  legal: "bg-gradient-to-br from-purple-500/30 to-indigo-600/20",
  logistics: "bg-gradient-to-br from-red-500/30 to-rose-600/20",
  insurance: "bg-gradient-to-br from-green-500/30 to-emerald-600/20",
  home_services: "bg-gradient-to-br from-orange-500/30 to-amber-600/20",
  solar_energy: "bg-gradient-to-br from-yellow-500/30 to-amber-600/20",
  travel_tourism: "bg-gradient-to-br from-blue-500/30 to-indigo-600/20",
  custom: "bg-gradient-to-br from-violet-500/30 to-purple-600/20",
};

// Domain-specific demo conversations
const DOMAIN_DEMOS: Record<string, { role: "ai" | "user"; text: string }[]> = {
  healthcare: [
    { role: "ai", text: "Hello! Thank you for calling. How can I help you today?" },
    { role: "user", text: "I'd like to schedule an appointment with Dr. Smith." },
    { role: "ai", text: "I'd be happy to help you schedule with Dr. Smith. I have availability this Thursday at 2 PM or Friday at 10 AM. Which works better for you?" },
    { role: "user", text: "Thursday at 2 PM sounds good." },
    { role: "ai", text: "You're all set! I've booked you with Dr. Smith on Thursday at 2:00 PM. You'll receive a confirmation text shortly. Is there anything else I can help with?" },
  ],
  sales: [
    { role: "ai", text: "Hi! I'm reaching out from Vonex AI. We help companies automate their customer communications. Do you have a moment?" },
    { role: "user", text: "Sure, what do you offer?" },
    { role: "ai", text: "We provide AI voice and chat agents that handle calls, qualify leads, and book demos automatically. What's your current process for handling inbound leads?" },
    { role: "user", text: "We have a team but they can't keep up with the volume." },
    { role: "ai", text: "That's exactly what our clients face. Would you be open to a 15-minute demo to see how we can help your team handle 10x the leads?" },
  ],
  customer_support: [
    { role: "ai", text: "Welcome to support! How can I assist you today?" },
    { role: "user", text: "My order hasn't arrived yet. It's been 5 days." },
    { role: "ai", text: "I'm sorry to hear that. Let me look into this for you. Could you please share your order number?" },
    { role: "user", text: "It's ORD-12345." },
    { role: "ai", text: "I found your order. It looks like there was a slight delay with the carrier. It's currently in transit and expected to arrive tomorrow. I've also added express priority to ensure it gets to you faster." },
  ],
  education: [
    { role: "ai", text: "Welcome to our admissions office! How can I help you today?" },
    { role: "user", text: "I'm interested in the computer science program." },
    { role: "ai", text: "Great choice! Our CS program offers specializations in AI, cybersecurity, and software engineering. Would you like information about prerequisites, or would you prefer to schedule a campus tour?" },
    { role: "user", text: "I'd like to know about the prerequisites." },
    { role: "ai", text: "For our CS program, you'll need a high school diploma with strong math background. We also accept transfer credits. Shall I send you the full admissions guide?" },
  ],
  real_estate: [
    { role: "ai", text: "Hi! Thanks for your interest in our listings. Are you looking to buy or rent?" },
    { role: "user", text: "I'm looking to buy a 3-bedroom house in the area." },
    { role: "ai", text: "I have several 3-bedroom homes available. What's your budget range and any must-have features like a garage or yard?" },
    { role: "user", text: "Under 500K, and I need a backyard." },
    { role: "ai", text: "I've found 4 properties matching your criteria. I can schedule viewings for this weekend if you're available. Shall I send you the listings with photos first?" },
  ],
  hospitality: [
    { role: "ai", text: "Welcome! Thank you for calling. How can I make your experience wonderful today?" },
    { role: "user", text: "I'd like to book a room for next weekend." },
    { role: "ai", text: "I'd love to help! We have standard rooms, suites, and our premium oceanview rooms available. How many guests and how many nights?" },
    { role: "user", text: "Two guests, two nights. What's available in suites?" },
    { role: "ai", text: "We have a beautiful king suite available for $299/night with complimentary breakfast and spa access. Shall I reserve it for you?" },
  ],
  ecommerce: [
    { role: "ai", text: "Hello! Welcome to our store. How can I help you today?" },
    { role: "user", text: "I'm looking for a gift for my friend's birthday." },
    { role: "ai", text: "How nice! What are your friend's interests? And do you have a budget in mind? I can suggest some popular gift options." },
    { role: "user", text: "She likes cooking. Maybe $50-80 range?" },
    { role: "ai", text: "I have some great options! Our premium knife set is $65, the gourmet spice collection is $55, or our bestselling cookbook bundle is $72. Would you like me to add any of these to your cart?" },
  ],
  automobile: [
    { role: "ai", text: "Welcome to our service center! How can I help you today?" },
    { role: "user", text: "My car needs an oil change and the check engine light is on." },
    { role: "ai", text: "I can help with both. For the oil change, we have appointments available tomorrow morning. For the check engine light, we'll run a diagnostic. What's your vehicle make, model, and year?" },
    { role: "user", text: "It's a 2022 Honda Civic." },
    { role: "ai", text: "I've scheduled you for tomorrow at 9 AM for an oil change and diagnostic. The oil change is $49.95 and the diagnostic is complimentary. See you then!" },
  ],
  manufacturing: [
    { role: "ai", text: "Manufacturing support here. How can I assist you?" },
    { role: "user", text: "I need a quote for 500 custom parts." },
    { role: "ai", text: "I can help with that. Could you tell me the material type, dimensions, and any specific tolerances required?" },
    { role: "user", text: "Stainless steel, 4 inches diameter, ±0.005 tolerance." },
    { role: "ai", text: "Got it. For 500 stainless steel parts at those specs, I'm estimating 2-3 weeks lead time. I'll have our engineering team prepare a detailed quote and send it to you within 24 hours." },
  ],
  banking: [
    { role: "ai", text: "Welcome to banking support. How may I assist you securely today?" },
    { role: "user", text: "I'd like to check my account balance and recent transactions." },
    { role: "ai", text: "For security, I'll need to verify your identity. Could you please confirm the last four digits of your account number and your date of birth?" },
    { role: "user", text: "1234, and January 15th." },
    { role: "ai", text: "Verified. Your checking account balance is $3,450.20. Your last three transactions were: grocery store $85.30, gas station $42.00, and a direct deposit of $2,800. Would you like more details?" },
  ],
  legal: [
    { role: "ai", text: "Thank you for contacting our law office. How can I assist you today?" },
    { role: "user", text: "I need help with a contract dispute." },
    { role: "ai", text: "I understand. Contract disputes are one of our areas of expertise. Could you briefly describe the nature of the dispute and the approximate value involved?" },
    { role: "user", text: "A vendor didn't deliver services as agreed. About $25,000." },
    { role: "ai", text: "I see. I'd like to schedule a consultation with our commercial litigation attorney. The initial consultation is complimentary. Are you available this week?" },
  ],
  logistics: [
    { role: "ai", text: "Logistics dispatch here. How can I help?" },
    { role: "user", text: "I need to track a shipment. Tracking number TRK-789." },
    { role: "ai", text: "Let me pull up that shipment... TRK-789 is currently at the regional distribution center and is scheduled for delivery tomorrow between 10 AM and 2 PM." },
    { role: "user", text: "Can it be delivered earlier?" },
    { role: "ai", text: "I can upgrade it to priority morning delivery for an additional $15. It would arrive between 8-10 AM. Would you like me to arrange that?" },
  ],
  insurance: [
    { role: "ai", text: "Thank you for calling. How can I help you with your insurance today?" },
    { role: "user", text: "I need to file a claim for a car accident." },
    { role: "ai", text: "I'm sorry to hear about the accident. I hope everyone is okay. Let me start the claims process. When did the accident occur?" },
    { role: "user", text: "Yesterday afternoon on Main Street." },
    { role: "ai", text: "I've initiated claim #CLM-4567. I'll need a few more details and photos of the damage. I'm sending you a secure link to upload everything. A claims adjuster will contact you within 24 hours." },
  ],
  home_services: [
    { role: "ai", text: "Home services booking — how can I help?" },
    { role: "user", text: "I need a plumber. My kitchen sink is leaking." },
    { role: "ai", text: "I can get a plumber out to you quickly. Is this an emergency leak or a slow drip? And what's your zip code?" },
    { role: "user", text: "Slow drip, zip code 90210." },
    { role: "ai", text: "I have a certified plumber available tomorrow at 11 AM. The service call fee is $75 which goes toward the repair. Shall I book that for you?" },
  ],
  solar_energy: [
    { role: "ai", text: "Welcome to our solar consultation line! Interested in going solar?" },
    { role: "user", text: "Yes, I want to know how much I can save on my electric bill." },
    { role: "ai", text: "Great question! What's your average monthly electric bill, and do you own your home? Also, roughly how much roof space faces south?" },
    { role: "user", text: "About $200/month, yes I own it, and most of the roof faces south." },
    { role: "ai", text: "Based on that, you could save 70-80% on your electric bill with a solar system. That's roughly $1,900/year. I'd love to schedule a free site assessment. Are you available this week?" },
  ],
  travel_tourism: [
    { role: "ai", text: "Hello! Ready to plan your next adventure? Where would you like to go?" },
    { role: "user", text: "I'm thinking about a week in Bali." },
    { role: "ai", text: "Bali is gorgeous! When are you thinking of traveling, and how many people? I can put together a complete package with flights, hotels, and activities." },
    { role: "user", text: "Two people, sometime in April." },
    { role: "ai", text: "April is perfect — dry season in Bali! I have packages starting at $1,899 per person including flights, 4-star beachfront resort, and guided temple tours. Shall I send you the full itinerary?" },
  ],
  custom: [
    { role: "ai", text: "Hi there! I'm a custom AI agent. How can I help you today?" },
    { role: "user", text: "I need help setting up an agent for my business." },
    { role: "ai", text: "I'd love to help! What industry is your business in, and what types of conversations would you like your AI agent to handle?" },
    { role: "user", text: "We're a fitness studio and need appointment booking." },
    { role: "ai", text: "A fitness studio agent is a great use case. I can help with class bookings, membership inquiries, and personal training scheduling. Let me walk you through the setup!" },
  ],
};

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const domainData = DOMAINS.find((d) => d.id === domain);
  if (!domainData) return { title: "Solution Not Found" };
  return {
    title: `${domainData.name} AI Agents - Vonex AI`,
    description: `AI voice and chat agents for ${domainData.name.toLowerCase()}. ${domainData.description}`,
  };
}

export default async function SolutionPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const domainData = DOMAINS.find((d) => d.id === domain);

  if (!domainData) {
    notFound();
  }

  const gradient = DOMAIN_GRADIENTS[domain] || DOMAIN_GRADIENTS.custom;
  const demoMessages = DOMAIN_DEMOS[domain] || DOMAIN_DEMOS.custom;

  return (
    <>
      <SolutionHero
        name={domainData.name}
        description={domainData.description}
        gradient={gradient}
      />
      <UseCases
        domainName={domainData.name}
        agentTypes={domainData.agentTypes}
      />
      <SolutionDemo
        domainName={domainData.name}
        messages={demoMessages}
      />
      <SolutionCta domainName={domainData.name} />
    </>
  );
}
