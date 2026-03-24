"use client";

import { useAgentBuilderStore } from "@/stores/agent-builder-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Wand2 } from "lucide-react";
import type { PersonalityTrait, ResponseStyle, AgentDomain } from "@/types";

const PERSONALITY_TRAITS: { value: PersonalityTrait; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "empathetic", label: "Empathetic" },
  { value: "authoritative", label: "Authoritative" },
  { value: "casual", label: "Casual" },
];

const RESPONSE_STYLES: { value: ResponseStyle; label: string; description: string }[] = [
  {
    value: "concise",
    label: "Concise",
    description: "Brief, to-the-point responses",
  },
  {
    value: "detailed",
    label: "Detailed",
    description: "Thorough, comprehensive answers",
  },
  {
    value: "conversational",
    label: "Conversational",
    description: "Natural, flowing dialogue",
  },
  {
    value: "formal",
    label: "Formal",
    description: "Professional, structured tone",
  },
];

const FIRST_MESSAGE_PLACEHOLDERS: Record<AgentDomain, string> = {
  healthcare:
    "Hello! Welcome to our healthcare center. How can I assist you today? Whether you need to schedule an appointment, check on lab results, or have a health-related question, I'm here to help.",
  sales:
    "Hi there! Thanks for your interest. I'd love to learn more about your business needs and see how we can help you grow. Do you have a few minutes to chat?",
  customer_support:
    "Welcome! I'm here to help you with any questions or issues you might have. What can I assist you with today?",
  education:
    "Hello! Welcome to our learning center. Whether you're looking to enroll in a course, need help with your studies, or have questions about our programs, I'm here to help!",
  real_estate:
    "Hi! Thanks for reaching out. I'd be happy to help you find your perfect property. Are you looking to buy, rent, or sell?",
  hospitality:
    "Welcome! Thank you for choosing us. I'm your virtual concierge and I'm here to make your stay exceptional. How can I help you today?",
  ecommerce:
    "Hello! Welcome to our store. I can help you find products, track orders, or answer any questions. What are you looking for today?",
  automobile:
    "Hello! Welcome to our auto center. I can help you with vehicle inquiries, schedule a service appointment, or check parts availability. How can I assist you?",
  manufacturing:
    "Hello! I'm your manufacturing operations assistant. I can help with production schedules, quality control reports, or inventory checks. What do you need?",
  banking:
    "Hello! Welcome to our banking service. I can help you with account inquiries, loan information, or answer questions about our financial products. How may I assist you?",
  legal:
    "Hello! Welcome to our legal services line. I can help with case status inquiries, document guidance, or schedule a consultation. How can I assist you today?",
  logistics:
    "Hello! I'm your logistics assistant. I can help you track shipments, coordinate deliveries, or answer questions about shipping. What can I help with?",
  insurance:
    "Hello! Welcome to our insurance services. I can help you with claims, policy questions, quotes, or coverage inquiries. How can I assist you today?",
  home_services:
    "Hello! Thanks for calling. I can help you schedule a service appointment, get an estimate, or handle an emergency request. What do you need help with?",
  solar_energy:
    "Hello! Thanks for your interest in solar energy. I can help you learn about solar solutions, get a quote, or check on your installation. How can I help?",
  travel_tourism:
    "Hello! Welcome to our travel service. I can help you book trips, modify itineraries, or find the perfect destination. Where would you like to go?",
  custom:
    "Hello! I'm your AI assistant. How can I help you today?",
};

const DEFAULT_PROMPTS: Record<AgentDomain, string> = {
  healthcare: `You are a professional healthcare assistant AI. Your role is to help patients with:
- Scheduling and managing appointments
- Answering general health questions (always recommend consulting a doctor for medical advice)
- Providing information about services and procedures
- Helping with prescription refill requests
- Triage and directing patients to appropriate care

Important guidelines:
- Never diagnose conditions or prescribe medications
- Always recommend consulting a healthcare professional for medical concerns
- Be empathetic and patient-focused
- Maintain HIPAA compliance at all times
- If a patient describes an emergency, direct them to call 911 immediately`,

  sales: `You are a professional sales agent AI. Your role is to:
- Qualify leads by understanding their needs and budget
- Present relevant solutions and product features
- Handle objections professionally
- Schedule demos or meetings with the sales team
- Follow up on previous conversations

Important guidelines:
- Be persuasive but never pushy or aggressive
- Listen actively and ask clarifying questions
- Focus on value and benefits, not just features
- Know when to escalate to a human sales representative
- Track and document lead information accurately`,

  customer_support: `You are a friendly customer support agent AI. Your role is to:
- Resolve customer issues efficiently and empathetically
- Answer frequently asked questions
- Process returns and exchanges
- Escalate complex issues to human agents when needed
- Collect feedback and satisfaction ratings

Important guidelines:
- Always be patient and understanding
- Apologize for inconveniences sincerely
- Provide clear, step-by-step solutions
- Follow up to ensure resolution
- Document all interactions for future reference`,

  education: `You are an educational assistant AI. Your role is to:
- Help students with enrollment and registration
- Provide course information and recommendations
- Answer questions about academic programs
- Assist with scheduling and deadlines
- Offer study tips and resources

Important guidelines:
- Be encouraging and supportive
- Provide accurate academic information
- Respect student privacy and data
- Direct complex issues to academic advisors
- Be inclusive and accessible to all students`,

  real_estate: `You are a professional real estate assistant AI. Your role is to:
- Help buyers find properties matching their criteria
- Schedule property viewings and tours
- Provide information about listings and neighborhoods
- Qualify potential buyers
- Answer questions about the buying/renting process

Important guidelines:
- Be knowledgeable about local real estate markets
- Provide accurate property information
- Respect buyer preferences and budget
- Follow fair housing guidelines
- Connect interested parties with licensed agents`,

  hospitality: `You are a hospitality concierge AI. Your role is to:
- Handle room reservations and modifications
- Provide local dining and activity recommendations
- Process guest requests and special accommodations
- Handle complaints and feedback
- Provide hotel/venue information and amenities

Important guidelines:
- Be warm, welcoming, and professional
- Anticipate guest needs proactively
- Handle complaints with empathy and urgency
- Maintain guest privacy and preferences
- Provide personalized recommendations`,

  ecommerce: `You are an e-commerce assistant AI. Your role is to:
- Help customers find and compare products
- Track orders and provide shipping updates
- Process returns and exchanges
- Provide product recommendations
- Answer questions about policies and procedures

Important guidelines:
- Be helpful and efficient
- Provide accurate product information
- Handle returns and complaints gracefully
- Suggest relevant complementary products
- Ensure secure handling of payment information`,

  automobile: `You are a professional automobile industry assistant AI. Your role is to:
- Answer vehicle inquiries and provide specifications
- Schedule service appointments and maintenance
- Assist with parts availability and pricing
- Provide information about warranties and recalls

Important guidelines:
- Be knowledgeable about vehicles and automotive services
- Provide accurate pricing and availability information
- Guide customers through their automotive needs efficiently
- Escalate complex mechanical issues to qualified technicians`,

  manufacturing: `You are a manufacturing operations assistant AI. Your role is to:
- Assist with production scheduling and status updates
- Handle quality control inquiries and reporting
- Manage inventory checks and reorder notifications
- Provide equipment maintenance information

Important guidelines:
- Be precise and follow standard operating procedures
- Prioritize safety in all recommendations
- Provide accurate production and inventory data
- Escalate equipment failures and safety concerns immediately`,

  banking: `You are a professional banking and finance assistant AI. Your role is to:
- Assist with account inquiries and balance information
- Provide loan and mortgage guidance
- Handle fraud alerts and security verifications
- Answer questions about banking products and services

Important guidelines:
- Never share sensitive account details without proper verification
- Be compliant with financial regulations
- Provide accurate interest rates and fee information
- Escalate suspicious activity to the fraud department immediately`,

  legal: `You are a professional legal services assistant AI. Your role is to:
- Handle initial legal inquiries and intake
- Provide case status updates
- Guide clients through document requirements
- Schedule consultations with attorneys

Important guidelines:
- Always clarify that you provide general information, not legal advice
- Recommend consulting with an attorney for specific legal matters
- Maintain strict confidentiality of client information
- Document all inquiries accurately for attorney review`,

  logistics: `You are a logistics and delivery assistant AI. Your role is to:
- Provide shipment tracking and delivery status updates
- Assist with dispatch coordination and scheduling
- Handle delivery issues and rerouting requests
- Answer questions about shipping rates and timelines

Important guidelines:
- Provide accurate and timely tracking information
- Be proactive about potential delays
- Offer alternative solutions for delivery issues
- Keep customers informed at every step of the process`,

  insurance: `You are a professional insurance assistant AI. Your role is to:
- Process initial claims intake and collect required information
- Handle policy renewal conversations and coverage reviews
- Generate insurance quotes based on customer details
- Answer coverage and policy questions

Important guidelines:
- Be thorough and accurate in collecting information
- Never make promises about coverage decisions or claim outcomes
- Comply with insurance regulations
- Recommend speaking with a licensed agent for complex matters`,

  home_services: `You are a home services assistant AI. Your role is to:
- Take service requests and collect details about the issue
- Schedule appointments and manage technician availability
- Triage emergency situations (plumbing, electrical, HVAC)
- Follow up on estimates and satisfaction

Important guidelines:
- For emergencies, prioritize urgency and safety
- Always confirm address and access details
- Be clear about estimated arrival times and costs
- Follow up to ensure customer satisfaction`,

  solar_energy: `You are a solar energy solutions assistant AI. Your role is to:
- Qualify homeowner leads for solar installation
- Explain solar technology, financing, and savings
- Schedule site assessments and installations
- Provide information about rebates and incentives

Important guidelines:
- Be knowledgeable about solar technology and financing options
- Help customers understand long-term value and savings
- Be transparent about costs and timelines
- Comply with local regulations and permit requirements`,

  travel_tourism: `You are a travel and tourism assistant AI. Your role is to:
- Assist with travel bookings (flights, hotels, packages)
- Handle itinerary changes and cancellations
- Provide destination information and recommendations
- Manage loyalty program inquiries

Important guidelines:
- Be enthusiastic and detail-oriented
- Confirm all booking details carefully
- Provide travel insurance options when relevant
- Help travelers feel confident about their journeys`,

  custom: `You are a helpful AI assistant. Follow the specific instructions provided by your operator and assist users with their needs. Be professional, friendly, and accurate in your responses.`,
};

export function StepPersona() {
  const {
    name,
    description,
    personalityTraits,
    responseStyle,
    firstMessage,
    systemPrompt,
    domain,
    updateField,
  } = useAgentBuilderStore();

  const toggleTrait = (trait: PersonalityTrait) => {
    const current = [...personalityTraits];
    const index = current.indexOf(trait);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(trait);
    }
    updateField("personalityTraits", current);
  };

  const fillTemplate = () => {
    const domainKey = domain || "custom";
    updateField("systemPrompt", DEFAULT_PROMPTS[domainKey]);
  };

  const placeholder =
    FIRST_MESSAGE_PLACEHOLDERS[domain || "custom"];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-1">Configure Persona</h2>
        <p className="text-sm text-muted-foreground">
          Define your agent&apos;s personality and communication style
        </p>
      </div>

      {/* Agent Name */}
      <div className="space-y-2">
        <Label htmlFor="agent-name">Agent Name <span className="text-destructive">*</span></Label>
        <Input
          id="agent-name"
          placeholder="e.g., Sarah, Alex, Support Bot"
          value={name}
          onChange={(e) => updateField("name", e.target.value)}
          maxLength={100}
          className={cn(name.length > 0 && name.trim().length < 2 && "border-destructive")}
        />
        <p className="text-xs text-muted-foreground">
          Give your agent a name that reflects its purpose (min. 2 characters)
        </p>
      </div>

      {/* Agent Description */}
      <div className="space-y-2">
        <Label htmlFor="agent-description">Agent Description</Label>
        <Textarea
          id="agent-description"
          placeholder="Describe what your agent does and its primary purpose..."
          value={description}
          onChange={(e) => updateField("description", e.target.value)}
          maxLength={500}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          {description.length}/500 characters
        </p>
      </div>

      {/* Personality Traits */}
      <div className="space-y-3">
        <Label>Personality Traits</Label>
        <div className="flex flex-wrap gap-2">
          {PERSONALITY_TRAITS.map((trait) => {
            const isSelected = personalityTraits.includes(trait.value);
            return (
              <Badge
                key={trait.value}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-sm px-4 py-1.5 transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-accent"
                )}
                onClick={() => toggleTrait(trait.value)}
              >
                {trait.label}
              </Badge>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Select one or more traits that define your agent&apos;s personality
        </p>
      </div>

      {/* Response Style */}
      <div className="space-y-3">
        <Label>Response Style</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {RESPONSE_STYLES.map((style) => (
            <button
              key={style.value}
              onClick={() => updateField("responseStyle", style.value)}
              className={cn(
                "flex flex-col items-start p-3 rounded-lg border transition-all text-left",
                responseStyle === style.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="text-sm font-medium">{style.label}</span>
              <span className="text-xs text-muted-foreground mt-0.5">
                {style.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* First Message */}
      <div className="space-y-2">
        <Label htmlFor="first-message">First Message <span className="text-destructive">*</span></Label>
        <Textarea
          id="first-message"
          placeholder={placeholder}
          value={firstMessage}
          onChange={(e) => updateField("firstMessage", e.target.value)}
          rows={3}
          className={cn(firstMessage.length > 0 && firstMessage.trim().length < 10 && "border-destructive")}
        />
        <p className="text-xs text-muted-foreground">
          The greeting message your agent will use when a conversation starts (min. 10 characters)
        </p>
      </div>

      {/* System Prompt */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="system-prompt">System Prompt</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fillTemplate}
          >
            <Wand2 className="h-3.5 w-3.5 mr-1.5" />
            Use Template
          </Button>
        </div>
        <Textarea
          id="system-prompt"
          placeholder="Enter the system prompt that defines your agent's behavior, rules, and capabilities..."
          value={systemPrompt}
          onChange={(e) => updateField("systemPrompt", e.target.value)}
          rows={10}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Define the core instructions and behavioral guidelines for your agent.
          Click &quot;Use Template&quot; to start with a suggested prompt based
          on your selected domain.
        </p>
      </div>
    </div>
  );
}
