"use client";

import { useAgentBuilderStore } from "@/stores/agent-builder-store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Check,
  Globe,
  User,
  Mic,
  BookOpen,
  Settings,
  Rocket,
  ArrowLeft,
  ArrowRight,
  Save,
  MonitorSmartphone,
  Phone,
} from "lucide-react";
import { StepDomain } from "@/components/agents/step-domain";
import { StepPersona } from "@/components/agents/step-persona";
import { StepVoice } from "@/components/agents/step-voice";
import { StepKnowledge } from "@/components/agents/step-knowledge";
import { StepAdvanced } from "@/components/agents/step-advanced";
import { StepReview } from "@/components/agents/step-review";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { toast } from "sonner";

/** Check if the current step has all required fields filled */
function useStepValidation() {
  const store = useAgentBuilderStore();
  return useMemo(() => {
    switch (store.currentStep) {
      case 0: // Channel — must select website or calling
        return !!store.agentChannel;
      case 1: // Domain — must select a domain
        return !!store.domain;
      case 2: // Persona — name and first message required
        return store.name.trim().length >= 2 && store.firstMessage.trim().length >= 10;
      case 3: // Voice — must select a voice
        return !!store.voiceId;
      case 4: // Knowledge — optional
        return true;
      case 5: // Settings — has sensible defaults
        return true;
      default:
        return true;
    }
  }, [store.currentStep, store.agentChannel, store.domain, store.name, store.firstMessage, store.voiceId]);
}

const STEPS = [
  { name: "Channel", icon: MonitorSmartphone },
  { name: "Domain", icon: Globe },
  { name: "Persona", icon: User },
  { name: "Voice", icon: Mic },
  { name: "Knowledge", icon: BookOpen },
  { name: "Settings", icon: Settings },
  { name: "Review", icon: Rocket },
] as const;

function StepChannel() {
  const { agentChannel, updateField, nextStep } = useAgentBuilderStore();

  const handleSelect = (channel: "website" | "calling") => {
    updateField("agentChannel", channel);
    nextStep();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold">Choose Agent Type</h2>
      <p className="mt-1 text-muted-foreground">
        Select the type of voice agent you want to create
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {/* Website Voice Agent */}
        <Card
          className={cn(
            "group relative cursor-pointer transition-all hover:shadow-lg hover:border-primary/50",
            agentChannel === "website" && "border-primary ring-2 ring-primary/20"
          )}
          onClick={() => handleSelect("website")}
        >
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <MonitorSmartphone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Website Voice Agent</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Embeddable voice widget for your website. Visitors can talk to your
              AI agent directly in the browser.
            </p>
            <ul className="mt-4 space-y-2 text-left text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Web SDK integration
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Custom widget styling
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Real-time transcripts
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Shareable public link
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Calling Agent */}
        <Card
          className={cn(
            "group relative cursor-pointer transition-all hover:shadow-lg hover:border-primary/50",
            agentChannel === "calling" && "border-primary ring-2 ring-primary/20"
          )}
          onClick={() => handleSelect("calling")}
        >
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Calling Agent</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Inbound and outbound phone calls with real phone numbers. Perfect for
              campaigns, support lines, and appointments.
            </p>
            <ul className="mt-4 space-y-2 text-left text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Real phone numbers
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Campaign management
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Call recording & transcripts
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Voicemail detection
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const STEP_COMPONENTS = [
  StepChannel,
  StepDomain,
  StepPersona,
  StepVoice,
  StepKnowledge,
  StepAdvanced,
  StepReview,
];

export default function AgentBuilderPage() {
  const router = useRouter();
  const { currentStep, nextStep, prevStep, setStep } = useAgentBuilderStore();
  const [saving, setSaving] = useState(false);
  const canProceed = useStepValidation();

  const progressValue = ((currentStep + 1) / STEPS.length) * 100;

  const StepComponent = STEP_COMPONENTS[currentStep];

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const state = useAgentBuilderStore.getState();
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name || "Untitled Agent",
          description: state.description,
          domain: state.domain || "custom",
          agent_type: state.agentType || "general",
          agent_channel: state.agentChannel || "website",
          status: "draft",
          personality_traits: {
            traits: state.personalityTraits,
            response_style: state.responseStyle,
          },
          system_prompt: state.systemPrompt,
          first_message: state.firstMessage,
          voice_id: state.voiceId || null,
          voice_gender: state.voiceGender || null,
          language: state.language,
          voice_settings: state.voiceSettings,
          llm_model: state.llmModel,
          temperature: state.temperature,
          max_turns: state.maxTurns,
          webhook_url: state.webhookUrl || null,
          advanced_settings: {
            allowed_topics: state.allowedTopics,
            blocked_topics: state.blockedTopics,
            hipaa_mode: state.hipaaMode,
            fallback_behavior: state.fallbackBehavior,
          },
        }),
      });

      if (res.ok) {
        const agent = await res.json();
        // Upload knowledge base items
        const kbState = useAgentBuilderStore.getState();
        for (const file of kbState.knowledgeFiles) {
          try {
            const fd = new FormData();
            fd.append("file", file);
            await fetch(`/api/agents/${agent.id}/knowledge`, { method: "POST", body: fd });
          } catch {}
        }
        for (const url of kbState.knowledgeUrls) {
          try {
            await fetch(`/api/agents/${agent.id}/knowledge`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ source_type: "url", source_url: url }),
            });
          } catch {}
        }
        for (const faq of kbState.faqs) {
          try {
            await fetch(`/api/agents/${agent.id}/knowledge`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ source_type: "faq", content: JSON.stringify(faq) }),
            });
          } catch {}
        }
        if (kbState.customInstructions.trim()) {
          try {
            await fetch(`/api/agents/${agent.id}/knowledge`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ source_type: "text", content: kbState.customInstructions }),
            });
          } catch {}
        }
        useAgentBuilderStore.getState().reset();
        toast.success(`Agent "${state.name}" created successfully`);
        router.push("/agents");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create agent");
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error("Failed to save agent");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Create New Agent</h1>
        <p className="text-muted-foreground mt-1">
          Configure your AI voice agent in {STEPS.length} simple steps
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div key={step.name} className="flex items-center">
                <button
                  onClick={() => {
                    if (index <= currentStep) {
                      setStep(index);
                    }
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 group",
                    index <= currentStep
                      ? "cursor-pointer"
                      : "cursor-not-allowed"
                  )}
                  disabled={index > currentStep}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : isCurrent
                        ? "border-primary text-primary bg-primary/10"
                        : "border-muted-foreground/30 text-muted-foreground/50"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium hidden sm:block",
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground/50"
                    )}
                  >
                    {step.name}
                  </span>
                </button>

                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-6 sm:w-12 lg:w-16 mx-1 sm:mx-2",
                      index < currentStep
                        ? "bg-primary"
                        : "bg-muted-foreground/20"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <Progress value={progressValue} className="h-1.5" />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            Step {currentStep + 1} of {STEPS.length}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[500px]">
        <StepComponent />
      </div>

      {/* Navigation Buttons — hide on Step 0 since cards auto-advance */}
      {currentStep > 0 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <div>
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Draft"}
            </Button>

            {currentStep < STEPS.length - 1 && (
              <Button onClick={nextStep} disabled={!canProceed}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
