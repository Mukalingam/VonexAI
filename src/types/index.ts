export type AgentStatus = "draft" | "active" | "paused" | "archived";
export type AgentChannel = "website" | "calling";
export type PlanTier = "free" | "pro" | "enterprise";
export type SourceType = "file" | "url" | "faq" | "text";
export type IndexingStatus = "pending" | "processing" | "indexed" | "failed";
export type ConversationStatus = "active" | "completed" | "error";
export type MessageRole = "user" | "agent" | "system";

export type AgentDomain =
  | "healthcare"
  | "sales"
  | "customer_support"
  | "education"
  | "real_estate"
  | "hospitality"
  | "ecommerce"
  | "automobile"
  | "manufacturing"
  | "banking"
  | "legal"
  | "logistics"
  | "insurance"
  | "home_services"
  | "solar_energy"
  | "travel_tourism"
  | "custom";

export type CallDirection = "inbound" | "outbound";
export type CallStatus =
  | "initiated"
  | "ringing"
  | "in_progress"
  | "completed"
  | "failed"
  | "no_answer"
  | "busy";
export type PhoneNumberStatus = "available" | "assigned" | "error" | "importing";

export type PersonalityTrait =
  | "professional"
  | "friendly"
  | "empathetic"
  | "authoritative"
  | "casual";

export type ResponseStyle =
  | "concise"
  | "detailed"
  | "conversational"
  | "formal";

export interface User {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  timezone: string | null;
  plan_tier: PlanTier;
  api_calls_used: number;
  api_calls_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  domain: AgentDomain;
  agent_type: string;
  agent_channel: AgentChannel;
  status: AgentStatus;
  personality_traits: {
    traits: PersonalityTrait[];
    response_style: ResponseStyle;
  };
  system_prompt: string;
  first_message: string;
  voice_id: string | null;
  voice_gender: string | null;
  language: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    speed: number;
  } | null;
  llm_model: string;
  temperature: number;
  max_turns: number;
  webhook_url: string | null;
  advanced_settings: {
    allowed_topics?: string[];
    blocked_topics?: string[];
    hipaa_mode?: boolean;
    fallback_behavior?: "transfer" | "escalate" | "collect_info";
    webhook_events?: string[];
  } | null;
  is_public: boolean;
  elevenlabs_agent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBase {
  id: string;
  agent_id: string;
  source_type: SourceType;
  file_path: string | null;
  source_url: string | null;
  content: string | null;
  metadata: Record<string, unknown> | null;
  indexing_status: IndexingStatus;
  created_at: string;
}

export interface Conversation {
  id: string;
  agent_id: string;
  user_id: string;
  status: ConversationStatus;
  total_turns: number;
  total_tokens: number;
  duration_seconds: number;
  sentiment_score: number | null;
  started_at: string;
  ended_at: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  audio_url: string | null;
  tokens_used: number;
  latency_ms: number;
  rating: number | null;
  created_at: string;
}

export interface VoiceOption {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  preview_url: string;
  description?: string;
  recommended?: boolean;
}

export type TelephonyProvider = "twilio" | "exotel" | "plivo" | "telnyx" | "vonage";

export interface TelephonyConfig {
  id: string;
  user_id: string;
  provider: TelephonyProvider;
  credentials: Record<string, string>;
  friendly_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Keep backward compatibility
export type TwilioConfig = TelephonyConfig;

export interface PhoneNumber {
  id: string;
  user_id: string;
  agent_id: string | null;
  telephony_config_id: string;
  phone_number: string;
  friendly_name: string | null;
  elevenlabs_phone_number_id: string | null;
  provider: TelephonyProvider;
  status: PhoneNumberStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  agent?: Agent;
  telephony_config?: TelephonyConfig;
  // Legacy alias
  twilio_config_id?: string;
  twilio_config?: TelephonyConfig;
}

export interface CallLog {
  id: string;
  user_id: string;
  agent_id: string;
  phone_number_id: string | null;
  elevenlabs_conversation_id: string | null;
  direction: CallDirection;
  status: CallStatus;
  from_number: string | null;
  to_number: string | null;
  duration_seconds: number;
  recording_url: string | null;
  transcript: { role: string; text: string; timestamp?: number }[] | null;
  sentiment_score: number | null;
  metadata: Record<string, unknown>;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  // Joined fields
  agent?: Agent;
  phone_number?: PhoneNumber;
}

export interface DomainConfig {
  id: AgentDomain;
  name: string;
  description: string;
  icon: string;
  agentTypes: { value: string; label: string }[];
  defaultPrompt: string;
}

// ============================================
// Campaigns
// ============================================

export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "failed";

export type CampaignCallStatus =
  | "pending"
  | "calling"
  | "completed"
  | "failed"
  | "no_answer"
  | "voicemail"
  | "skipped";

export interface CampaignContact {
  phone: string;
  name?: string;
  variables?: Record<string, string>;
}

export interface CampaignSettings {
  max_retries?: number;
  retry_delay_minutes?: number;
  calling_hours_start?: string; // "09:00"
  calling_hours_end?: string;   // "17:00"
}

export interface Campaign {
  id: string;
  user_id: string;
  agent_id: string;
  phone_number_id: string;
  name: string;
  status: CampaignStatus;
  contacts: CampaignContact[];
  total_contacts: number;
  completed_calls: number;
  successful_calls: number;
  failed_calls: number;
  settings: CampaignSettings;
  created_at: string;
  updated_at: string;
  // Joined fields
  agent?: Agent;
  phone_number?: PhoneNumber;
}

export interface CampaignCall {
  id: string;
  campaign_id: string;
  call_log_id: string | null;
  contact_phone: string;
  contact_name: string | null;
  contact_variables: Record<string, string>;
  status: CampaignCallStatus;
  attempts: number;
  last_attempt_at: string | null;
  outcome: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  call_log?: CallLog;
}
