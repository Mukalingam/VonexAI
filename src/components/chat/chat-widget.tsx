"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Bot,
  User,
  Loader2,
  MessageSquare,
  X,
  Maximize2,
  Minimize2,
  ThumbsUp,
  ThumbsDown,
  Radio,
} from "lucide-react";
import { cn, generateId } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import type { Agent, Message } from "@/types";
import { toast } from "sonner";

const LANGUAGE_TO_BCP47: Record<string, string> = {
  en: "en-US", hi: "hi-IN", es: "es-ES", fr: "fr-FR", de: "de-DE",
  it: "it-IT", pt: "pt-BR", ja: "ja-JP", ko: "ko-KR", zh: "zh-CN",
  ar: "ar-SA", ru: "ru-RU", nl: "nl-NL", pl: "pl-PL", sv: "sv-SE",
  tr: "tr-TR", id: "id-ID", th: "th-TH", vi: "vi-VN",
};

interface ChatWidgetProps {
  agent: Agent;
  fullPage?: boolean;
  apiBasePath?: string;
}

export function ChatWidget({ agent, fullPage = false, apiBasePath }: ChatWidgetProps) {
  const chatApiUrl = apiBasePath ? `${apiBasePath}/chat` : `/api/agents/${agent.id}/chat`;
  const voiceApiUrl = apiBasePath ? `${apiBasePath}/chat/voice` : `/api/agents/${agent.id}/chat/voice`;

  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(fullPage);
  const [isFullscreen, setIsFullscreen] = useState(fullPage);
  const [isMuted, setIsMuted] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isStoppingRef = useRef(false);
  const greetingSentRef = useRef(false);
  // Always-on mic refs
  const alwaysOnVadRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    messages,
    isLoading,
    isRecording,
    conversationId,
    isAlwaysListening,
    listeningState,
    addMessage,
    setLoading,
    setRecording,
    setConversationId,
    setAlwaysListening,
    setListeningState,
    reset,
  } = useChatStore();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, liveTranscript, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !conversationId && messages.length === 0 && agent.first_message && !greetingSentRef.current) {
      greetingSentRef.current = true;
      const greeting: Message = {
        id: generateId(),
        conversation_id: "",
        role: "agent",
        content: agent.first_message,
        audio_url: null,
        tokens_used: 0,
        latency_ms: 0,
        rating: null,
        created_at: new Date().toISOString(),
      };
      addMessage(greeting);
    }
  }, [isOpen, conversationId, messages.length, agent.first_message, addMessage]);

  // Stop agent audio
  const stopAgentAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeAttribute("src");
      setIsAgentSpeaking(false);
    }
  }, []);

  // Play agent audio
  const playAgentAudio = useCallback((audioUrl: string) => {
    if (!audioRef.current || isMuted) return;
    stopAgentAudio();
    audioRef.current.src = audioUrl;
    setIsAgentSpeaking(true);
    audioRef.current.play().catch((err) => {
      console.error("[Audio] Play failed:", err);
      setIsAgentSpeaking(false);
    });
  }, [isMuted, stopAgentAudio]);

  // Track audio end/error — auto-resume listening after TTS ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      setIsAgentSpeaking(false);
      // Auto-resume always-on listening after agent finishes speaking
      if (isAlwaysListening && listeningState === "processing") {
        resumeAlwaysOnListening();
      }
    };
    const onError = (e: Event) => {
      console.error("[Audio] Error:", e);
      setIsAgentSpeaking(false);
      if (isAlwaysListening && listeningState === "processing") {
        resumeAlwaysOnListening();
      }
    };
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAlwaysListening, listeningState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      teardownAlwaysOn();
      if (silenceCheckRef.current) clearInterval(silenceCheckRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch { /* ignore */ }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============= ALWAYS-ON MICROPHONE =============

  // Initialize the persistent audio pipeline for always-on mode
  async function initAlwaysOnPipeline() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = analyser;

      setListeningState("idle");
      startVadMonitoring();
    } catch {
      toast.error("Microphone access denied.");
      setAlwaysListening(false);
      setListeningState("off");
    }
  }

  // Start VAD monitoring in idle state - detect speech onset
  function startVadMonitoring() {
    if (alwaysOnVadRef.current) clearInterval(alwaysOnVadRef.current);

    let speechFrames = 0;
    const SPEECH_ONSET_THRESHOLD = 15;
    const FRAMES_FOR_ONSET = 3; // 300ms of sustained speech to trigger

    alwaysOnVadRef.current = setInterval(() => {
      if (!analyserRef.current) return;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((s, v) => s + v, 0) / dataArray.length;

      if (avg > SPEECH_ONSET_THRESHOLD) {
        speechFrames++;
        if (speechFrames >= FRAMES_FOR_ONSET) {
          // Speech detected! Start recording
          if (alwaysOnVadRef.current) clearInterval(alwaysOnVadRef.current);
          alwaysOnVadRef.current = null;
          startAlwaysOnCapture();
        }
      } else {
        speechFrames = 0;
      }
    }, 100);
  }

  // Start capturing audio (transition from IDLE to RECORDING)
  function startAlwaysOnCapture() {
    if (!streamRef.current) return;

    isStoppingRef.current = false;
    stopAgentAudio(); // Barge-in if agent is speaking

    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    mediaRecorder.start(200);

    // Start live transcription
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = LANGUAGE_TO_BCP47[agent.language || "en"] || "en-US";
      let fullTranscript = "";
      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            fullTranscript += event.results[i][0].transcript + " ";
          } else {
            interim = event.results[i][0].transcript;
          }
        }
        setLiveTranscript((fullTranscript + interim).trim());
      };
      recognition.onerror = () => {};
      recognition.onend = () => {};
      recognitionRef.current = recognition;
      recognition.start();
    }

    setRecording(true);
    setListeningState("recording");
    setLiveTranscript("");

    // Silence detection to auto-stop recording
    let silentFrames = 0;
    let hasSpoken = false;
    const SILENCE_THRESHOLD = 12;
    const FRAMES_TO_STOP = 18; // 1.8s of silence

    silenceCheckRef.current = setInterval(() => {
      if (!analyserRef.current || isStoppingRef.current) return;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((s, v) => s + v, 0) / dataArray.length;

      if (avg > SILENCE_THRESHOLD) {
        hasSpoken = true;
        silentFrames = 0;
      } else if (hasSpoken) {
        silentFrames++;
        if (silentFrames >= FRAMES_TO_STOP) {
          isStoppingRef.current = true;
          stopAlwaysOnCapture();
        }
      }
    }, 100);

    // Hard limit 60s
    silenceTimerRef.current = setTimeout(() => {
      if (!isStoppingRef.current) {
        isStoppingRef.current = true;
        stopAlwaysOnCapture();
      }
    }, 60000);
  }

  // Stop recording and process (transition from RECORDING to PROCESSING)
  async function stopAlwaysOnCapture() {
    const transcript = liveTranscript;
    setRecording(false);
    setLiveTranscript("");
    setListeningState("processing");

    // Clean up recording-specific resources (but keep stream + audioContext alive)
    if (silenceCheckRef.current) {
      clearInterval(silenceCheckRef.current);
      silenceCheckRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }

    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      resumeAlwaysOnListening();
      return;
    }

    await new Promise<void>((resolve) => {
      mediaRecorder.onstop = () => resolve();
      mediaRecorder.stop();
    });

    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    audioChunksRef.current = [];

    if (blob.size < 500) {
      resumeAlwaysOnListening();
      return;
    }

    await processVoiceRecording(blob, transcript);

    // If no audio response (or muted), resume listening immediately
    // Otherwise, the audio onEnded handler will resume
    if (isMuted || !isAgentSpeaking) {
      resumeTimeoutRef.current = setTimeout(() => {
        if (isAlwaysListening) {
          resumeAlwaysOnListening();
        }
      }, 500);
    }
  }

  // Resume to IDLE state (start VAD monitoring again)
  function resumeAlwaysOnListening() {
    if (!streamRef.current || !analyserRef.current) return;
    setListeningState("idle");
    startVadMonitoring();
  }

  // Tear down the entire always-on pipeline
  function teardownAlwaysOn() {
    if (alwaysOnVadRef.current) {
      clearInterval(alwaysOnVadRef.current);
      alwaysOnVadRef.current = null;
    }
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    if (silenceCheckRef.current) {
      clearInterval(silenceCheckRef.current);
      silenceCheckRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch { /* ignore */ }
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch { /* ignore */ }
      audioContextRef.current = null;
      analyserRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setRecording(false);
    setListeningState("off");
  }

  // Toggle always-on mode
  function toggleAlwaysOn() {
    if (isAlwaysListening) {
      teardownAlwaysOn();
      setAlwaysListening(false);
    } else {
      setAlwaysListening(true);
      initAlwaysOnPipeline();
    }
  }

  // ============= PUSH-TO-TALK (legacy) =============

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      conversation_id: conversationId || "",
      role: "user",
      content: input.trim(),
      audio_url: null,
      tokens_used: 0,
      latency_ms: 0,
      rating: null,
      created_at: new Date().toISOString(),
    };

    addMessage(userMessage);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(chatApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_id: conversationId,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");
      const data = await res.json();

      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      const agentMessage: Message = {
        id: generateId(),
        conversation_id: data.conversation_id || "",
        role: "agent",
        content: data.text,
        audio_url: data.audio_url || null,
        tokens_used: data.tokens_used || 0,
        latency_ms: data.latency_ms || 0,
        rating: null,
        created_at: new Date().toISOString(),
      };
      addMessage(agentMessage);

      if (data.audio_url && !isMuted) {
        playAgentAudio(data.audio_url);
      }
    } catch {
      toast.error("Failed to get agent response. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Send recorded voice to server
  async function processVoiceRecording(blob: Blob, transcript: string) {
    if (blob.size < 500) {
      toast.error("Recording too short. Please try again.");
      return;
    }

    if (transcript.trim()) {
      addMessage({
        id: generateId(),
        conversation_id: conversationId || "",
        role: "user",
        content: transcript.trim(),
        audio_url: null,
        tokens_used: 0,
        latency_ms: 0,
        rating: null,
        created_at: new Date().toISOString(),
      });
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("audio", blob);
      formData.append("conversation_id", conversationId || "");

      const res = await fetch(voiceApiUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Voice chat failed");
      }
      const data = await res.json();

      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      if (!transcript.trim() && data.user_transcription) {
        addMessage({
          id: generateId(),
          conversation_id: data.conversation_id || "",
          role: "user",
          content: data.user_transcription,
          audio_url: null,
          tokens_used: 0,
          latency_ms: 0,
          rating: null,
          created_at: new Date().toISOString(),
        });
      }

      addMessage({
        id: generateId(),
        conversation_id: data.conversation_id || "",
        role: "agent",
        content: data.text,
        audio_url: data.audio_url || null,
        tokens_used: data.tokens_used || 0,
        latency_ms: data.latency_ms || 0,
        rating: null,
        created_at: new Date().toISOString(),
      });

      if (data.audio_url && !isMuted) {
        playAgentAudio(data.audio_url);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Voice processing failed");
    } finally {
      setLoading(false);
    }
  }

  // Push-to-talk cleanup
  function cleanupRecording() {
    if (silenceCheckRef.current) {
      clearInterval(silenceCheckRef.current);
      silenceCheckRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch { /* ignore */ }
      audioContextRef.current = null;
      analyserRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  // Push-to-talk start
  async function handleVoiceStart() {
    if (isAlwaysListening) return;
    if (isRecording) {
      handleVoiceStop();
      return;
    }

    isStoppingRef.current = false;
    stopAgentAudio();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.start(200);

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = LANGUAGE_TO_BCP47[agent.language || "en"] || "en-US";
        let fullTranscript = "";
        recognition.onresult = (event: any) => {
          let interim = "";
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              fullTranscript += event.results[i][0].transcript + " ";
            } else {
              interim = event.results[i][0].transcript;
            }
          }
          setLiveTranscript((fullTranscript + interim).trim());
        };
        recognition.onerror = () => {};
        recognition.onend = () => {};
        recognitionRef.current = recognition;
        recognition.start();
      }

      setRecording(true);
      setLiveTranscript("");

      let silentFrames = 0;
      let hasSpoken = false;
      const SILENCE_THRESHOLD = 12;
      const FRAMES_TO_STOP = 18;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      silenceCheckRef.current = setInterval(() => {
        if (!analyserRef.current || isStoppingRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((s, v) => s + v, 0) / dataArray.length;

        if (avg > SILENCE_THRESHOLD) {
          hasSpoken = true;
          silentFrames = 0;
        } else if (hasSpoken) {
          silentFrames++;
          if (silentFrames >= FRAMES_TO_STOP) {
            isStoppingRef.current = true;
            handleVoiceStop();
          }
        }
      }, 100);

      silenceTimerRef.current = setTimeout(() => {
        if (!isStoppingRef.current) {
          isStoppingRef.current = true;
          handleVoiceStop();
        }
      }, 60000);
    } catch {
      toast.error("Microphone access denied.");
    }
  }

  // Push-to-talk stop
  async function handleVoiceStop() {
    const transcript = liveTranscript;
    setRecording(false);
    setLiveTranscript("");

    const mediaRecorder = mediaRecorderRef.current;
    cleanupRecording();

    if (!mediaRecorder || mediaRecorder.state === "inactive") return;

    await new Promise<void>((resolve) => {
      mediaRecorder.onstop = () => resolve();
      mediaRecorder.stop();
    });

    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    audioChunksRef.current = [];

    await processVoiceRecording(blob, transcript);
  }

  function handleReset() {
    stopAgentAudio();
    if (isAlwaysListening) {
      teardownAlwaysOn();
      setAlwaysListening(false);
    } else {
      cleanupRecording();
      setRecording(false);
    }
    setLiveTranscript("");
    greetingSentRef.current = false;
    reset();
    toast.success("Conversation reset");
  }

  async function handleRate(messageId: string, rating: number) {
    try {
      await fetch(`/api/conversations/${conversationId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_id: messageId, rating }),
      });
    } catch { /* ignore */ }
  }

  function getStatusLabel() {
    if (isAgentSpeaking) return "Speaking...";
    if (isLoading) return "Thinking...";
    if (isAlwaysListening) {
      if (listeningState === "recording" || isRecording) return "Listening...";
      if (listeningState === "processing") return "Processing...";
      if (listeningState === "idle") return "Ready - Speak anytime";
      return "Online";
    }
    if (isRecording) return "Listening...";
    return "Online";
  }

  if (!fullPage && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105 flex items-center justify-center"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    );
  }

  const containerClass = fullPage
    ? "flex flex-col h-full"
    : cn(
        "fixed z-50 bg-background border rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300",
        isFullscreen ? "inset-2 sm:inset-4" : "bottom-0 right-0 w-full h-[100dvh] sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[600px] sm:rounded-xl rounded-none"
      );

  return (
    <div className={containerClass}>
      {!fullPage && (
        <div className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-xs">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{agent.name}</p>
              <p className="text-xs opacity-80">{getStatusLabel()}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => { setIsOpen(false); setIsFullscreen(false); }}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex gap-3", message.role === "user" ? "flex-row-reverse" : "flex-row")}>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className={cn("text-xs", message.role === "user" ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary")}>
                  {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div className={cn("max-w-[75%] space-y-1", message.role === "user" ? "items-end" : "items-start")}>
                <div className={cn("rounded-2xl px-4 py-2.5 text-sm", message.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md")}>
                  {message.role === "agent" ? (
                    <div className="prose prose-sm max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>h2]:text-base [&>h2]:font-semibold [&>h2]:mt-2 [&>h2]:mb-1 [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mt-2 [&>h3]:mb-1 [&>ul]:pl-4 [&>ol]:pl-4 [&>li]:my-0.5">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {message.role === "agent" && (
                    <div className="flex gap-1">
                      <button onClick={() => handleRate(message.id, 5)} className="text-muted-foreground hover:text-success transition-colors"><ThumbsUp className="h-3 w-3" /></button>
                      <button onClick={() => handleRate(message.id, 1)} className="text-muted-foreground hover:text-destructive transition-colors"><ThumbsDown className="h-3 w-3" /></button>
                    </div>
                  )}
                  {message.audio_url && (
                    <button onClick={() => playAgentAudio(message.audio_url!)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <Volume2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {(isRecording || (isAlwaysListening && listeningState === "recording")) && liveTranscript && (
            <div className="flex gap-3 flex-row-reverse">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-accent text-accent-foreground text-xs"><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div className="max-w-[75%]">
                <div className="rounded-2xl px-4 py-2.5 text-sm bg-primary/70 text-primary-foreground rounded-br-md">
                  {liveTranscript}
                  <span className="inline-block w-0.5 h-4 bg-primary-foreground/70 ml-0.5 animate-pulse align-middle" />
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs"><Bot className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-3">
        {/* Always-on listening indicator */}
        {isAlwaysListening && (
          <div className="mb-2 flex items-center gap-3 px-2 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200">
            {listeningState === "idle" && (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500" />
                </span>
                <span className="text-xs font-medium text-indigo-700">Ready</span>
                <span className="text-[10px] text-indigo-600/70 flex-1 text-right">Speak anytime...</span>
              </>
            )}
            {listeningState === "recording" && (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                <span className="text-xs font-medium text-red-600">Recording</span>
                <span className="text-[10px] text-muted-foreground flex-1 text-right">
                  {liveTranscript ? "Auto-stops when you pause..." : "Listening..."}
                </span>
              </>
            )}
            {listeningState === "processing" && (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span className="text-xs font-medium text-primary">Processing</span>
                <span className="text-[10px] text-muted-foreground flex-1 text-right">Getting response...</span>
              </>
            )}
          </div>
        )}

        {/* Push-to-talk recording indicator (non-always-on mode) */}
        {!isAlwaysListening && isRecording && (
          <div className="mb-2 flex items-center gap-3 px-2 py-1.5 rounded-lg bg-destructive/10">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
            </span>
            <span className="text-xs font-medium text-destructive">Listening</span>
            <span className="text-[10px] text-muted-foreground flex-1 text-right">
              {liveTranscript ? "Auto-stops when you pause..." : "Speak now..."}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={handleReset} title="Reset conversation">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => { if (isAgentSpeaking) stopAgentAudio(); setIsMuted(!isMuted); }} title={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          {/* Always-on mic toggle */}
          <Button
            variant={isAlwaysListening ? "default" : "ghost"}
            size="icon"
            className={cn(
              "shrink-0 transition-all",
              isAlwaysListening && "bg-indigo-600 hover:bg-indigo-700 text-white ring-2 ring-indigo-300"
            )}
            onClick={toggleAlwaysOn}
            title={isAlwaysListening ? "Disable always-on mic" : "Enable always-on mic"}
            disabled={isLoading && !isAlwaysListening}
          >
            <Radio className="h-4 w-4" />
          </Button>

          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex flex-1 items-center gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isAlwaysListening ? "Always-on mic active..." : isRecording ? "Listening..." : "Type a message..."}
              disabled={isLoading || isRecording}
              className="flex-1"
            />
            {/* Push-to-talk button (hidden when always-on is active) */}
            {!isAlwaysListening && (
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                className={cn("shrink-0 transition-all", isRecording && "animate-pulse ring-2 ring-destructive/50")}
                onClick={isRecording ? handleVoiceStop : handleVoiceStart}
                disabled={isLoading}
                title={isRecording ? "Stop" : "Speak"}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            <Button type="submit" size="icon" className="shrink-0" disabled={!input.trim() || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>

      <audio ref={audioRef} className="hidden" preload="auto" />
    </div>
  );
}
