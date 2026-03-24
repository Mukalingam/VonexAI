"use client";

import { useState, type KeyboardEvent } from "react";
import { useAgentBuilderStore } from "@/stores/agent-builder-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { X, AlertTriangle, Shield } from "lucide-react";

const LLM_MODEL_GROUPS = [
  {
    provider: "Anthropic Claude",
    models: [
      { value: "claude-sonnet-4-5", label: "Claude Sonnet 4.5", description: "Latest - Most Capable" },
      { value: "claude-sonnet-4", label: "Claude Sonnet 4", description: "Recommended - Fast & Capable" },
      { value: "claude-haiku-4-5", label: "Claude Haiku 4.5", description: "Fastest - Budget Friendly" },
      { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet", description: "Previous Gen - Reliable" },
      { value: "claude-3-haiku", label: "Claude 3 Haiku", description: "Previous Gen - Fast" },
    ],
  },
  {
    provider: "OpenAI GPT",
    models: [
      { value: "gpt-4o", label: "GPT-4o", description: "Most Capable - Multimodal" },
      { value: "gpt-4o-mini", label: "GPT-4o Mini", description: "Fast & Affordable" },
      { value: "gpt-4-turbo", label: "GPT-4 Turbo", description: "High Performance" },
      { value: "gpt-4", label: "GPT-4", description: "Reliable - Standard" },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", description: "Budget - Legacy" },
    ],
  },
  {
    provider: "Google Gemini",
    models: [
      { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", description: "Latest - Fast & Smart" },
      { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", description: "Fast & Efficient" },
      { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite", description: "Ultra Fast - Budget" },
      { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro", description: "Previous Gen - Powerful" },
      { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash", description: "Previous Gen - Fast" },
    ],
  },
  {
    provider: "DeepSeek (Custom LLM)",
    models: [
      { value: "custom-llm", label: "DeepSeek R1", description: "Via Custom LLM Integration" },
    ],
  },
];

const FALLBACK_OPTIONS = [
  {
    value: "transfer" as const,
    label: "Transfer to human",
    description: "Transfer the call to a live agent",
  },
  {
    value: "escalate" as const,
    label: "Escalate",
    description: "Create a support ticket and notify the team",
  },
  {
    value: "collect_info" as const,
    label: "Collect information",
    description: "Gather details and promise a follow-up",
  },
];

export function StepAdvanced() {
  const {
    llmModel,
    temperature,
    maxTurns,
    webhookUrl,
    allowedTopics,
    blockedTopics,
    hipaaMode,
    fallbackBehavior,
    updateField,
  } = useAgentBuilderStore();

  const [allowedInput, setAllowedInput] = useState("");
  const [blockedInput, setBlockedInput] = useState("");

  const handleAddTag = (
    type: "allowedTopics" | "blockedTopics",
    value: string,
    setter: (val: string) => void
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const current =
      type === "allowedTopics" ? allowedTopics : blockedTopics;
    if (current.includes(trimmed)) return;

    updateField(type, [...current, trimmed]);
    setter("");
  };

  const handleRemoveTag = (
    type: "allowedTopics" | "blockedTopics",
    index: number
  ) => {
    const current =
      type === "allowedTopics" ? [...allowedTopics] : [...blockedTopics];
    current.splice(index, 1);
    updateField(type, current);
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    type: "allowedTopics" | "blockedTopics",
    value: string,
    setter: (val: string) => void
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(type, value, setter);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-1">Advanced Settings</h2>
        <p className="text-sm text-muted-foreground">
          Fine-tune your agent&apos;s behavior and capabilities
        </p>
      </div>

      {/* LLM Model */}
      <div className="space-y-2">
        <Label htmlFor="llm-model">LLM Model</Label>
        <Select
          value={llmModel}
          onValueChange={(value) => updateField("llmModel", value)}
        >
          <SelectTrigger id="llm-model" className="w-full max-w-md">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {LLM_MODEL_GROUPS.map((group) => (
              <SelectGroup key={group.provider}>
                <SelectLabel className="text-xs font-semibold text-primary">
                  {group.provider}
                </SelectLabel>
                {group.models.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <div className="flex items-center gap-2">
                      <span>{model.label}</span>
                      <span className="text-xs text-muted-foreground">
                        ({model.description})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Choose the LLM that powers your agent&apos;s intelligence
        </p>
      </div>

      {/* Temperature */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Temperature</Label>
          <span className="text-sm text-muted-foreground font-mono">
            {temperature.toFixed(2)}
          </span>
        </div>
        <Slider
          value={[temperature]}
          onValueChange={([value]) => updateField("temperature", value)}
          min={0}
          max={1}
          step={0.01}
          className="max-w-md"
        />
        <p className="text-xs text-muted-foreground">
          Lower values make responses more focused and deterministic. Higher
          values make responses more creative and varied.
        </p>
      </div>

      {/* Max Conversation Turns */}
      <div className="space-y-2">
        <Label htmlFor="max-turns">Max Conversation Turns</Label>
        <Input
          id="max-turns"
          type="number"
          min={1}
          max={100}
          value={maxTurns}
          onChange={(e) =>
            updateField("maxTurns", parseInt(e.target.value) || 50)
          }
          className="w-full max-w-[200px]"
        />
        <p className="text-xs text-muted-foreground">
          Maximum number of back-and-forth exchanges per conversation (1-100)
        </p>
      </div>

      {/* Webhook URL */}
      <div className="space-y-2">
        <Label htmlFor="webhook-url">Webhook URL (Optional)</Label>
        <Input
          id="webhook-url"
          type="url"
          placeholder="https://your-server.com/webhook"
          value={webhookUrl}
          onChange={(e) => updateField("webhookUrl", e.target.value)}
          className="max-w-md"
        />
        <p className="text-xs text-muted-foreground">
          Receive real-time conversation events at this endpoint
        </p>
      </div>

      {/* Allowed Topics */}
      <div className="space-y-3">
        <Label>Allowed Topics</Label>
        <div className="flex gap-2 max-w-md">
          <Input
            placeholder="Type a topic and press Enter"
            value={allowedInput}
            onChange={(e) => setAllowedInput(e.target.value)}
            onKeyDown={(e) =>
              handleKeyDown(e, "allowedTopics", allowedInput, setAllowedInput)
            }
          />
        </div>
        {allowedTopics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allowedTopics.map((topic, index) => (
              <Badge
                key={`allowed-${index}`}
                variant="secondary"
                className="gap-1 pr-1"
              >
                {topic}
                <button
                  type="button"
                  onClick={() => handleRemoveTag("allowedTopics", index)}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          If specified, the agent will only discuss these topics. Leave empty to
          allow all topics.
        </p>
      </div>

      {/* Blocked Topics */}
      <div className="space-y-3">
        <Label>Blocked Topics</Label>
        <div className="flex gap-2 max-w-md">
          <Input
            placeholder="Type a topic and press Enter"
            value={blockedInput}
            onChange={(e) => setBlockedInput(e.target.value)}
            onKeyDown={(e) =>
              handleKeyDown(e, "blockedTopics", blockedInput, setBlockedInput)
            }
          />
        </div>
        {blockedTopics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {blockedTopics.map((topic, index) => (
              <Badge
                key={`blocked-${index}`}
                variant="destructive"
                className="gap-1 pr-1"
              >
                {topic}
                <button
                  type="button"
                  onClick={() => handleRemoveTag("blockedTopics", index)}
                  className="ml-1 hover:bg-destructive/80 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Topics the agent should refuse to discuss
        </p>
      </div>

      {/* Fallback Behavior */}
      <div className="space-y-3">
        <Label>Fallback Behavior</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FALLBACK_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateField("fallbackBehavior", option.value)}
              className={cn(
                "flex flex-col items-start p-3 rounded-lg border transition-all text-left",
                fallbackBehavior === option.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="text-sm font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground mt-0.5">
                {option.description}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          What should happen when the agent cannot handle a request
        </p>
      </div>

      {/* HIPAA Mode */}
      <div className="space-y-3">
        <div className="flex items-center justify-between max-w-md">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <Label htmlFor="hipaa-mode">HIPAA Compliance Mode</Label>
          </div>
          <Switch
            id="hipaa-mode"
            checked={hipaaMode}
            onCheckedChange={(checked) => updateField("hipaaMode", checked)}
          />
        </div>

        {hipaaMode && (
          <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-500/50 bg-amber-50 max-w-md">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-800">
              <p className="font-medium">HIPAA Mode Enabled</p>
              <p className="mt-1">
                Conversations will be encrypted at rest and in transit. No PHI
                will be stored in logs. Ensure your deployment environment
                complies with HIPAA requirements.
              </p>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Enable enhanced privacy controls for healthcare data compliance
        </p>
      </div>
    </div>
  );
}
