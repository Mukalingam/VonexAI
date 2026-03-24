"use client";

import { create } from "zustand";
import type { Message } from "@/types";

export type ListeningState = "off" | "idle" | "recording" | "processing";

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isRecording: boolean;
  conversationId: string | null;
  isAlwaysListening: boolean;
  listeningState: ListeningState;
  debugInfo: {
    promptSent: string;
    tokensUsed: number;
    latencyMs: number;
    voiceGenTime: number;
  } | null;

  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setLoading: (loading: boolean) => void;
  setRecording: (recording: boolean) => void;
  setConversationId: (id: string | null) => void;
  setAlwaysListening: (listening: boolean) => void;
  setListeningState: (state: ListeningState) => void;
  setDebugInfo: (info: ChatState["debugInfo"]) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  messages: [],
  isLoading: false,
  isRecording: false,
  conversationId: null,
  isAlwaysListening: false,
  listeningState: "off" as ListeningState,
  debugInfo: null,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setLoading: (isLoading) => set({ isLoading }),
  setRecording: (isRecording) => set({ isRecording }),
  setConversationId: (conversationId) => set({ conversationId }),
  setAlwaysListening: (isAlwaysListening) => set({ isAlwaysListening }),
  setListeningState: (listeningState) => set({ listeningState }),
  setDebugInfo: (debugInfo) => set({ debugInfo }),
  reset: () =>
    set({
      messages: [],
      isLoading: false,
      isRecording: false,
      conversationId: null,
      isAlwaysListening: false,
      listeningState: "off" as ListeningState,
      debugInfo: null,
    }),
}));
