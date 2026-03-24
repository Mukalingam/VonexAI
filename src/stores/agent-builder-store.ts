"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AgentChannel,
  AgentDomain,
  PersonalityTrait,
  ResponseStyle,
} from "@/types";

export interface AgentBuilderState {
  currentStep: number;

  // Step 0: Channel
  agentChannel: AgentChannel | null;

  // Step 1: Domain
  domain: AgentDomain | null;
  agentType: string;

  // Step 2: Persona
  name: string;
  description: string;
  personalityTraits: PersonalityTrait[];
  responseStyle: ResponseStyle;
  firstMessage: string;
  systemPrompt: string;

  // Step 3: Voice
  voiceId: string;
  voiceGender: string;
  language: string;
  voiceSettings: {
    stability: number;
    similarity_boost: number;
    style: number;
    speed: number;
  };

  // Step 4: Knowledge Base
  knowledgeFiles: File[];
  knowledgeUrls: string[];
  faqs: { question: string; answer: string }[];
  customInstructions: string;

  // Step 5: Advanced
  llmModel: string;
  temperature: number;
  maxTurns: number;
  webhookUrl: string;
  allowedTopics: string[];
  blockedTopics: string[];
  hipaaMode: boolean;
  fallbackBehavior: "transfer" | "escalate" | "collect_info";

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateField: <K extends keyof AgentBuilderState>(
    field: K,
    value: AgentBuilderState[K]
  ) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 0,
  agentChannel: null as AgentChannel | null,
  domain: null as AgentDomain | null,
  agentType: "",
  name: "",
  description: "",
  personalityTraits: [] as PersonalityTrait[],
  responseStyle: "conversational" as ResponseStyle,
  firstMessage: "",
  systemPrompt: "",
  voiceId: "",
  voiceGender: "female",
  language: "en",
  voiceSettings: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0,
    speed: 1,
  },
  knowledgeFiles: [] as File[],
  knowledgeUrls: [] as string[],
  faqs: [] as { question: string; answer: string }[],
  customInstructions: "",
  llmModel: "claude-sonnet-4",
  temperature: 0.7,
  maxTurns: 50,
  webhookUrl: "",
  allowedTopics: [] as string[],
  blockedTopics: [] as string[],
  hipaaMode: false,
  fallbackBehavior: "collect_info" as const,
};

export const useAgentBuilderStore = create<AgentBuilderState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(0, state.currentStep - 1),
        })),
      updateField: (field, value) => set({ [field]: value }),
      reset: () => set(initialState),
    }),
    {
      name: "agent-builder",
      partialize: (state) => {
        // Don't persist File objects
        const { knowledgeFiles, ...rest } = state;
        return rest;
      },
    }
  )
);
