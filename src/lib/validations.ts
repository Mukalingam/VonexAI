import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  accept_terms: z.literal(true, "You must accept the terms of service"),
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().optional(),
  timezone: z.string().optional(),
});

export const agentBasicSchema = z.object({
  name: z.string().min(2, "Agent name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  domain: z.enum([
    "healthcare",
    "sales",
    "customer_support",
    "education",
    "real_estate",
    "hospitality",
    "ecommerce",
    "automobile",
    "manufacturing",
    "banking",
    "legal",
    "logistics",
    "insurance",
    "home_services",
    "solar_energy",
    "travel_tourism",
    "custom",
  ]),
  agent_type: z.string().min(1, "Please select an agent type"),
});

export const agentPersonaSchema = z.object({
  personality_traits: z.array(z.string()).min(1, "Select at least one trait"),
  response_style: z.enum(["concise", "detailed", "conversational", "formal"]),
  first_message: z.string().min(5, "First message must be at least 5 characters"),
  system_prompt: z.string().min(10, "System prompt must be at least 10 characters"),
});

export const agentVoiceSchema = z.object({
  voice_id: z.string().min(1, "Please select a voice"),
  voice_gender: z.enum(["male", "female", "neutral"]).optional(),
  language: z.string().default("en"),
  voice_settings: z
    .object({
      stability: z.number().min(0).max(1).default(0.5),
      similarity_boost: z.number().min(0).max(1).default(0.75),
      style: z.number().min(0).max(1).default(0),
      speed: z.number().min(0.5).max(2).default(1),
    })
    .optional(),
});

export const agentAdvancedSchema = z.object({
  llm_model: z.string().default("claude-sonnet-4"),
  temperature: z.number().min(0).max(1).default(0.7),
  max_turns: z.number().min(1).max(100).default(50),
  webhook_url: z.string().url().optional().or(z.literal("")),
  allowed_topics: z.array(z.string()).optional(),
  blocked_topics: z.array(z.string()).optional(),
  hipaa_mode: z.boolean().default(false),
  fallback_behavior: z
    .enum(["transfer", "escalate", "collect_info"])
    .default("collect_info"),
});

export const knowledgeFaqSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  answer: z.string().min(5, "Answer must be at least 5 characters"),
});

export const knowledgeUrlSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

export const telephonyProviderSchema = z.enum(["twilio", "exotel", "plivo", "telnyx", "vonage"]);

export const telephonyConfigSchema = z.object({
  provider: telephonyProviderSchema,
  credentials: z.record(z.string(), z.string()),
  friendly_name: z.string().max(255).optional(),
});

// Legacy alias
export const twilioConfigSchema = z.object({
  account_sid: z
    .string()
    .min(1, "Account SID is required")
    .regex(/^AC[a-f0-9]{32}$/, "Account SID must start with 'AC' followed by 32 hex characters"),
  auth_token: z
    .string()
    .min(1, "Auth Token is required")
    .regex(/^[a-f0-9]{32}$/, "Auth Token must be 32 hex characters"),
  friendly_name: z.string().max(255).optional(),
});

export const outboundCallSchema = z.object({
  agent_id: z.string().uuid("Invalid agent ID"),
  phone_number_id: z.string().uuid("Invalid phone number ID"),
  to_number: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g., +14155551234)"),
  contact_name: z.string().max(255).optional(),
});

export const phoneNumberImportSchema = z.object({
  telephony_config_id: z.string().uuid("Invalid telephony config ID"),
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format"),
  friendly_name: z.string().max(255).optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type AgentBasicInput = z.infer<typeof agentBasicSchema>;
export type AgentPersonaInput = z.infer<typeof agentPersonaSchema>;
export type AgentVoiceInput = z.infer<typeof agentVoiceSchema>;
export type AgentAdvancedInput = z.infer<typeof agentAdvancedSchema>;
export type TwilioConfigInput = z.infer<typeof twilioConfigSchema>;
export type TelephonyConfigInput = z.infer<typeof telephonyConfigSchema>;
export type OutboundCallInput = z.infer<typeof outboundCallSchema>;
export type PhoneNumberImportInput = z.infer<typeof phoneNumberImportSchema>;

// ============================================
// Campaigns
// ============================================

export const campaignContactSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g., +14155551234)"),
  name: z.string().optional(),
  variables: z.record(z.string(), z.string()).optional(),
});

export const campaignSettingsSchema = z.object({
  max_retries: z.number().min(0).max(5).default(0),
  retry_delay_minutes: z.number().min(1).max(1440).default(30),
  calling_hours_start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  calling_hours_end: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export const campaignCreateSchema = z.object({
  name: z.string().min(2, "Campaign name must be at least 2 characters").max(200),
  agent_id: z.string().uuid("Invalid agent ID"),
  phone_number_id: z.string().uuid("Invalid phone number ID"),
  contacts: z.array(campaignContactSchema).min(1, "At least one contact is required"),
  settings: campaignSettingsSchema.optional(),
});

export const campaignUpdateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  settings: campaignSettingsSchema.optional(),
});

export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>;
export type CampaignUpdateInput = z.infer<typeof campaignUpdateSchema>;
