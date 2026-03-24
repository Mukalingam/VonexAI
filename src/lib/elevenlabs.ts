const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

function getHeaders() {
  return {
    "xi-api-key": process.env.ELEVENLABS_API_KEY!,
    "Content-Type": "application/json",
  };
}

export async function listVoices() {
  const res = await fetch(`${ELEVENLABS_API_URL}/voices`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`ElevenLabs API error: ${res.statusText}`);
  return res.json();
}

export async function getVoice(voiceId: string) {
  const res = await fetch(`${ELEVENLABS_API_URL}/voices/${voiceId}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`ElevenLabs API error: ${res.statusText}`);
  return res.json();
}

export async function getVoicePreview(voiceId: string) {
  const res = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        text: "Hello! I'm your AI voice agent. How can I help you today?",
        model_id: "eleven_flash_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`ElevenLabs API error: ${res.statusText}`);
  return res.arrayBuffer();
}

// Map app LLM model names to ElevenLabs-supported model IDs
function mapLlmModel(model?: string): string {
  const modelMap: Record<string, string> = {
    "claude-sonnet-4-20250514": "claude-sonnet-4-20250514",
    "claude-3-5-sonnet-20241022": "claude-3-5-sonnet",
    "gpt-4o": "gpt-4o",
    "gpt-4o-mini": "gpt-4o-mini",
    "gemini-2.0-flash": "gemini-2.0-flash",
    "gemini-2.5-flash": "gemini-2.0-flash",
    "deepseek-r1": "custom-llm/deepseek-r1",
  };
  return modelMap[model || ""] || "gemini-2.0-flash";
}

export async function createConversationalAgent(config: {
  name: string;
  system_prompt: string;
  first_message: string;
  voice_id: string;
  language?: string;
  llm_model?: string;
  temperature?: number;
  max_turns?: number;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    speed?: number;
  };
}) {
  const language = config.language || "en";
  // ElevenLabs ConvAI requires turbo_v2 or flash_v2 for English (not v2_5 variants)
  const ttsModel = language === "en" ? "eleven_turbo_v2" : "eleven_multilingual_v2";

  const stability = config.voice_settings?.stability ?? 0.5;
  const similarityBoost = config.voice_settings?.similarity_boost ?? 0.75;
  const speed = config.voice_settings?.speed ?? 1;

  // Inject outbound calling instructions into system prompt
  const outboundInstructions = `\n\nIMPORTANT OUTBOUND CALL RULES:
- You are making an outbound call. You already have the caller's phone number and WhatsApp number — they are the SAME number you are calling.
- NEVER ask for their phone number, mobile number, or WhatsApp number. You already have it.
- If the contact's name is provided via {{contact_name}}, greet them by name naturally in your first message.
- If someone asks you to send details on WhatsApp, say "Sure, I'll send the details to your WhatsApp shortly" — do NOT ask for the number.
- Focus on the conversation goal. Do not ask for information you should already have.
- Keep responses short — max 2 sentences per turn.`;

  const enhancedPrompt = config.system_prompt + outboundInstructions;

  // Make first message dynamic: if contact_name is available, greet by name
  const dynamicFirstMessage = config.first_message.includes("{{contact_name}}")
    ? config.first_message
    : `{{#if contact_name}}Hi {{contact_name}}, {{else}}Hi, {{/if}}${config.first_message.replace(/^(Hi,?\s*|Hello,?\s*)/i, "")}`;

  const payload = {
    name: config.name,
    conversation_config: {
      agent: {
        prompt: {
          prompt: enhancedPrompt,
          llm: mapLlmModel(config.llm_model),
          temperature: config.temperature ?? 0.7,
          max_tokens: -1,
        },
        first_message: dynamicFirstMessage,
        language,
      },
      asr: {
        quality: "high",
        provider: "elevenlabs",
      },
      tts: {
        voice_id: config.voice_id,
        model_id: ttsModel,
        stability,
        similarity_boost: similarityBoost,
        speed,
        optimize_streaming_latency: 4,
      },
      turn: {
        turn_timeout: 15,
        silence_end_call_timeout: 30,
        soft_timeout_config: {
          timeout_seconds: 6.0,
          use_llm_generated_message: true,
          message: "Are you still there?",
        },
      },
      conversation: {
        max_duration_seconds: config.max_turns ? config.max_turns * 60 : 1800,
      },
    },
  };

  console.log("[ElevenLabs] Creating agent with config:", JSON.stringify(payload, null, 2));

  const res = await fetch(
    `${ELEVENLABS_API_URL}/convai/agents/create`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    const error = await res.text();
    console.error("[ElevenLabs] Agent creation failed:", error);
    throw new Error(`ElevenLabs agent creation failed: ${error}`);
  }
  const result = await res.json();
  console.log("[ElevenLabs] Agent created successfully:", JSON.stringify(result));
  return result;
}

export async function updateConversationalAgent(
  agentId: string,
  config: Record<string, unknown>
) {
  const res = await fetch(
    `${ELEVENLABS_API_URL}/convai/agents/${agentId}`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(config),
    }
  );
  if (!res.ok) throw new Error(`ElevenLabs API error: ${res.statusText}`);
  return res.json();
}

export async function deleteConversationalAgent(agentId: string) {
  const res = await fetch(
    `${ELEVENLABS_API_URL}/convai/agents/${agentId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );
  if (!res.ok) throw new Error(`ElevenLabs API error: ${res.statusText}`);
  return true;
}

export async function textToSpeech(
  voiceId: string,
  text: string,
  settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    speed?: number;
  },
  language?: string
) {
  const modelId = (!language || language === "en")
    ? "eleven_flash_v2_5"
    : "eleven_multilingual_v2";

  const res = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}/stream`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: settings?.stability ?? 0.5,
          similarity_boost: settings?.similarity_boost ?? 0.75,
          style: settings?.style ?? 0,
          use_speaker_boost: true,
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`ElevenLabs TTS error: ${res.statusText}`);
  return res;
}

export async function speechToText(audioBlob: Blob, languageCode?: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("model_id", "scribe_v1");
  if (languageCode) {
    formData.append("language_code", languageCode);
  }

  const res = await fetch(`${ELEVENLABS_API_URL}/speech-to-text`, {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`ElevenLabs STT error: ${errorText}`);
  }

  const data = await res.json();
  return data.text || "";
}

export function getSignedAgentUrl(agentId: string) {
  return `${ELEVENLABS_API_URL}/convai/agents/${agentId}/link`;
}

// ============================================
// Phone Calling API (Twilio + ElevenLabs)
// ============================================

export async function importTwilioPhoneNumber(config: {
  phone_number: string;
  twilio_account_sid: string;
  twilio_auth_token: string;
  agent_id?: string;
  label?: string;
}) {
  const res = await fetch(`${ELEVENLABS_API_URL}/convai/phone-numbers/create`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      phone_number: config.phone_number,
      provider: "twilio",
      sid: config.twilio_account_sid,
      token: config.twilio_auth_token,
      ...(config.agent_id && { agent_id: config.agent_id }),
      ...(config.label && { label: config.label }),
    }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to import phone number: ${error}`);
  }
  return res.json();
}

export async function listElevenLabsPhoneNumbers() {
  const res = await fetch(`${ELEVENLABS_API_URL}/convai/phone-numbers`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`ElevenLabs API error: ${res.statusText}`);
  return res.json();
}

export async function getElevenLabsPhoneNumber(phoneNumberId: string) {
  const res = await fetch(
    `${ELEVENLABS_API_URL}/convai/phone-numbers/${phoneNumberId}`,
    { headers: getHeaders() }
  );
  if (!res.ok) throw new Error(`ElevenLabs API error: ${res.statusText}`);
  return res.json();
}

export async function updateElevenLabsPhoneNumber(
  phoneNumberId: string,
  config: { agent_id?: string; label?: string }
) {
  const res = await fetch(
    `${ELEVENLABS_API_URL}/convai/phone-numbers/${phoneNumberId}`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(config),
    }
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to update phone number: ${error}`);
  }
  return res.json();
}

export async function deleteElevenLabsPhoneNumber(phoneNumberId: string) {
  const res = await fetch(
    `${ELEVENLABS_API_URL}/convai/phone-numbers/${phoneNumberId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );
  if (!res.ok) throw new Error(`ElevenLabs API error: ${res.statusText}`);
  return true;
}

export async function makeOutboundCall(config: {
  agent_id: string;
  agent_phone_number_id: string;
  to_number: string;
  provider?: string;
  conversation_initiation_client_data?: Record<string, string>;
}) {
  const payload = {
    agent_id: config.agent_id,
    agent_phone_number_id: config.agent_phone_number_id,
    to_number: config.to_number,
    ...(config.conversation_initiation_client_data && {
      conversation_initiation_client_data: config.conversation_initiation_client_data,
    }),
  };

  console.log("[ElevenLabs] Making outbound call:", JSON.stringify(payload));

  // Route to the correct ElevenLabs endpoint based on provider
  // ElevenLabs has provider-specific endpoints for outbound calls
  const provider = config.provider || "twilio";
  const endpointMap: Record<string, string> = {
    twilio: `${ELEVENLABS_API_URL}/convai/twilio/outbound-call`,
    plivo: `${ELEVENLABS_API_URL}/convai/plivo/outbound-call`,
    telnyx: `${ELEVENLABS_API_URL}/convai/telnyx/outbound-call`,
    vonage: `${ELEVENLABS_API_URL}/convai/vonage/outbound-call`,
    exotel: `${ELEVENLABS_API_URL}/convai/exotel/outbound-call`,
  };
  const endpoint = endpointMap[provider] || endpointMap.twilio;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.text();
    console.error("[ElevenLabs] Outbound call failed:", error);
    throw new Error(`Failed to make outbound call: ${error}`);
  }
  const result = await res.json();
  console.log("[ElevenLabs] Outbound call response:", JSON.stringify(result));
  return result;
}

export async function listConversations(params?: {
  agent_id?: string;
  call_successful?: string;
  cursor?: string;
  page_size?: number;
  call_start_after_unix?: number;
  call_start_before_unix?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.agent_id) searchParams.set("agent_id", params.agent_id);
  if (params?.call_successful) searchParams.set("call_successful", params.call_successful);
  if (params?.cursor) searchParams.set("cursor", params.cursor);
  if (params?.page_size) searchParams.set("page_size", params.page_size.toString());
  if (params?.call_start_after_unix) searchParams.set("call_start_after_unix", params.call_start_after_unix.toString());
  if (params?.call_start_before_unix) searchParams.set("call_start_before_unix", params.call_start_before_unix.toString());

  const qs = searchParams.toString();
  const res = await fetch(
    `${ELEVENLABS_API_URL}/convai/conversations${qs ? `?${qs}` : ""}`,
    { headers: getHeaders() }
  );
  if (!res.ok) throw new Error(`ElevenLabs API error: ${res.statusText}`);
  return res.json();
}

export async function getConversation(conversationId: string) {
  const res = await fetch(
    `${ELEVENLABS_API_URL}/convai/conversations/${conversationId}`,
    { headers: getHeaders() }
  );
  if (!res.ok) throw new Error(`ElevenLabs API error: ${res.statusText}`);
  const data = await res.json();
  console.log("[ElevenLabs] Conversation detail:", JSON.stringify({
    id: conversationId,
    status: data.status,
    duration: data.metadata?.call_duration_secs,
    transcript_count: data.transcript?.length,
    analysis: data.analysis,
    termination_reason: data.termination_reason || data.metadata?.termination_reason,
  }));
  return data;
}

export async function getConversationAudio(conversationId: string) {
  const res = await fetch(
    `${ELEVENLABS_API_URL}/convai/conversations/${conversationId}/audio`,
    { headers: getHeaders() }
  );
  if (!res.ok) throw new Error(`ElevenLabs API error: ${res.statusText}`);
  return res;
}
