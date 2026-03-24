import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Map ElevenLabs model IDs to Anthropic API model IDs for text chat
// Non-Claude models fall back to claude-sonnet-4 for text chat
const ANTHROPIC_MODEL_MAP: Record<string, string> = {
  "claude-sonnet-4-6": "claude-sonnet-4-6",
  "claude-sonnet-4-5": "claude-sonnet-4-20250514",
  "claude-sonnet-4": "claude-sonnet-4-20250514",
  "claude-haiku-4-5": "claude-haiku-4-5-20251001",
  "claude-3-5-sonnet": "claude-3-5-sonnet-20241022",
  "claude-3-haiku": "claude-3-haiku-20240307",
};

function resolveAnthropicModel(model: string): string {
  return ANTHROPIC_MODEL_MAP[model] || "claude-sonnet-4-20250514";
}

export async function generateAgentResponse(config: {
  systemPrompt: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
  userMessage: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  const messages = [
    ...config.conversationHistory,
    { role: "user" as const, content: config.userMessage },
  ];

  const response = await anthropic.messages.create({
    model: resolveAnthropicModel(config.model || "claude-sonnet-4"),
    max_tokens: config.maxTokens || 1024,
    temperature: config.temperature ?? 0.7,
    system: config.systemPrompt,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return {
    text: textBlock?.text || "",
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    stopReason: response.stop_reason,
  };
}

export { anthropic };
