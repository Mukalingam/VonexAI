"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAgentBuilderStore } from "@/stores/agent-builder-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  User,
  Mic,
  BookOpen,
  Settings,
  Pencil,
  Rocket,
  Save,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

const DOMAIN_LABELS: Record<string, string> = {
  healthcare: "Healthcare",
  sales: "Sales & Lead Gen",
  customer_support: "Customer Support",
  education: "Education",
  real_estate: "Real Estate",
  hospitality: "Hospitality",
  ecommerce: "E-Commerce",
  custom: "Custom",
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  pl: "Polish",
  hi: "Hindi",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  ar: "Arabic",
  nl: "Dutch",
  sv: "Swedish",
  tr: "Turkish",
};

export function StepReview() {
  const router = useRouter();
  const store = useAgentBuilderStore();
  const {
    agentChannel,
    domain,
    agentType,
    name,
    description,
    personalityTraits,
    responseStyle,
    firstMessage,
    systemPrompt,
    voiceId,
    voiceGender,
    language,
    voiceSettings,
    knowledgeFiles,
    knowledgeUrls,
    faqs,
    customInstructions,
    llmModel,
    temperature,
    maxTurns,
    webhookUrl,
    allowedTopics,
    blockedTopics,
    hipaaMode,
    fallbackBehavior,
    setStep,
    reset,
  } = store;

  const [deploying, setDeploying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deployedAgentId, setDeployedAgentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Upload knowledge base items after agent creation
  const uploadKnowledgeItems = async (agentId: string) => {
    // Upload files
    for (const file of knowledgeFiles) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        await fetch(`/api/agents/${agentId}/knowledge`, {
          method: "POST",
          body: formData,
        });
      } catch (err) {
        console.error(`Failed to upload file ${file.name}:`, err);
      }
    }

    // Upload URLs
    for (const url of knowledgeUrls) {
      try {
        await fetch(`/api/agents/${agentId}/knowledge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source_type: "url", source_url: url }),
        });
      } catch (err) {
        console.error(`Failed to add URL ${url}:`, err);
      }
    }

    // Upload FAQs
    for (const faq of faqs) {
      try {
        await fetch(`/api/agents/${agentId}/knowledge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source_type: "faq",
            content: JSON.stringify(faq),
          }),
        });
      } catch (err) {
        console.error("Failed to add FAQ:", err);
      }
    }

    // Upload custom instructions as text
    if (customInstructions.trim()) {
      try {
        await fetch(`/api/agents/${agentId}/knowledge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source_type: "text",
            content: customInstructions,
            metadata: { label: "Custom Instructions" },
          }),
        });
      } catch (err) {
        console.error("Failed to add custom instructions:", err);
      }
    }
  };

  const buildPayload = () => ({
    name: name || "Untitled Agent",
    description,
    domain: domain || "custom",
    agent_type: agentType || "general",
    agent_channel: agentChannel || "website",
    personality_traits: {
      traits: personalityTraits,
      response_style: responseStyle,
    },
    system_prompt: systemPrompt,
    first_message: firstMessage,
    voice_id: voiceId || null,
    voice_gender: voiceGender || null,
    language,
    voice_settings: voiceSettings,
    llm_model: llmModel,
    temperature,
    max_turns: maxTurns,
    webhook_url: webhookUrl || null,
    advanced_settings: {
      allowed_topics: allowedTopics,
      blocked_topics: blockedTopics,
      hipaa_mode: hipaaMode,
      fallback_behavior: fallbackBehavior,
    },
  });

  const handleSaveDraft = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildPayload(), status: "draft" }),
      });
      if (!res.ok) throw new Error("Failed to save draft");
      const agent = await res.json();
      await uploadKnowledgeItems(agent.id);
      reset();
      router.push("/agents");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const handleDeploy = async () => {
    setDeploying(true);
    setError(null);
    try {
      // Create agent
      const createRes = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildPayload(), status: "draft" }),
      });
      if (!createRes.ok) throw new Error("Failed to create agent");
      const agent = await createRes.json();

      // Upload knowledge base items
      await uploadKnowledgeItems(agent.id);

      // Deploy agent
      const deployRes = await fetch(`/api/agents/${agent.id}/deploy`, {
        method: "POST",
      });
      if (!deployRes.ok) throw new Error("Failed to deploy agent");

      setDeployedAgentId(agent.id);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deploy agent");
    } finally {
      setDeploying(false);
    }
  };

  // Success state
  if (deployedAgentId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100">
          <CheckCircle2 className="h-8 w-8 text-indigo-600" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Agent Deployed!</h2>
          <p className="text-muted-foreground">
            Your AI voice agent is now live and ready to handle conversations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <a href={`/agents/${deployedAgentId}/test`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Test Agent
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={`/agents/${deployedAgentId}`}>View Agent Details</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-1">Review & Deploy</h2>
        <p className="text-sm text-muted-foreground">
          Review your agent configuration before deploying
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {/* Domain & Type */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Domain & Type</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Domain</span>
                <p className="font-medium">
                  {domain ? DOMAIN_LABELS[domain] || domain : "Not selected"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Agent Type</span>
                <p className="font-medium capitalize">
                  {agentType?.replace(/_/g, " ") || "Not selected"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Persona */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Agent Persona</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(2)}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name</span>
                <p className="font-medium">{name || "Not set"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Response Style</span>
                <p className="font-medium capitalize">{responseStyle}</p>
              </div>
            </div>
            {description && (
              <div className="text-sm">
                <span className="text-muted-foreground">Description</span>
                <p className="font-medium">{description}</p>
              </div>
            )}
            {personalityTraits.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground">Traits</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {personalityTraits.map((trait) => (
                    <Badge key={trait} variant="secondary" className="capitalize text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {firstMessage && (
              <div className="text-sm">
                <span className="text-muted-foreground">First Message</span>
                <p className="font-medium text-xs mt-1 p-2 rounded bg-muted">
                  {firstMessage}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Voice Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Voice Configuration</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(3)}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Voice ID</span>
                <p className="font-medium font-mono text-xs truncate">
                  {voiceId || "Not selected"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Gender</span>
                <p className="font-medium capitalize">
                  {voiceGender || "Not set"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Language</span>
                <p className="font-medium">
                  {LANGUAGE_LABELS[language] || language}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Speed</span>
                <p className="font-medium">{voiceSettings.speed}x</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Base */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Knowledge Base</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(4)}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Files</span>
                <p className="font-medium">{knowledgeFiles.length}</p>
              </div>
              <div>
                <span className="text-muted-foreground">URLs</span>
                <p className="font-medium">{knowledgeUrls.length}</p>
              </div>
              <div>
                <span className="text-muted-foreground">FAQs</span>
                <p className="font-medium">{faqs.length}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Instructions</span>
                <p className="font-medium">
                  {customInstructions ? "Added" : "None"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Advanced Settings</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(5)}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Model</span>
                <p className="font-medium text-xs font-mono">
                  {llmModel.includes("sonnet")
                    ? "Claude Sonnet 4"
                    : "Claude Opus 4"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Temperature</span>
                <p className="font-medium">{temperature}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Max Turns</span>
                <p className="font-medium">{maxTurns}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Fallback</span>
                <p className="font-medium capitalize">
                  {fallbackBehavior.replace(/_/g, " ")}
                </p>
              </div>
            </div>

            {(hipaaMode ||
              allowedTopics.length > 0 ||
              blockedTopics.length > 0 ||
              webhookUrl) && (
              <>
                <Separator className="my-3" />
                <div className="space-y-2 text-sm">
                  {hipaaMode && (
                    <Badge variant="warning">HIPAA Mode Enabled</Badge>
                  )}
                  {webhookUrl && (
                    <div>
                      <span className="text-muted-foreground">Webhook</span>
                      <p className="font-medium text-xs font-mono truncate">
                        {webhookUrl}
                      </p>
                    </div>
                  )}
                  {allowedTopics.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">
                        Allowed Topics
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {allowedTopics.map((t) => (
                          <Badge key={t} variant="secondary" className="text-xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {blockedTopics.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">
                        Blocked Topics
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {blockedTopics.map((t) => (
                          <Badge key={t} variant="destructive" className="text-xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleSaveDraft}
          disabled={saving || deploying}
          className="w-full sm:w-auto"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? "Saving..." : "Save as Draft"}
        </Button>
        <Button
          size="lg"
          onClick={handleDeploy}
          disabled={saving || deploying}
          className="w-full sm:w-auto"
        >
          {deploying ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Rocket className="h-4 w-4 mr-2" />
          )}
          {deploying ? "Deploying..." : "Deploy Agent"}
        </Button>
      </div>
    </div>
  );
}
