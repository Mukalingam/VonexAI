"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Play,
  Pause,
  Trash2,
  MessageSquare,
  BookOpen,
  Save,
  Loader2,
  Rocket,
  ExternalLink,
  Share2,
  Square,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Agent, AgentDomain, VoiceOption } from "@/types";

const DOMAIN_LABELS: Record<string, string> = {
  healthcare: "Healthcare",
  sales: "Sales & Lead Gen",
  customer_support: "Customer Support",
  education: "Education",
  real_estate: "Real Estate",
  hospitality: "Hospitality",
  ecommerce: "E-Commerce",
  automobile: "Automobile",
  manufacturing: "Manufacturing",
  banking: "Banking & Finance",
  legal: "Legal",
  logistics: "Logistics",
  insurance: "Insurance",
  home_services: "Home Services",
  solar_energy: "Solar & Energy",
  travel_tourism: "Travel & Tourism",
  custom: "Custom",
};

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "pl", label: "Polish" },
  { value: "hi", label: "Hindi" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
  { value: "ar", label: "Arabic" },
  { value: "nl", label: "Dutch" },
  { value: "sv", label: "Swedish" },
  { value: "tr", label: "Turkish" },
];

const STATUS_VARIANTS: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  active: "success",
  paused: "warning",
  draft: "secondary",
  archived: "destructive",
};

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Editable fields
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSystemPrompt, setEditSystemPrompt] = useState("");
  const [editFirstMessage, setEditFirstMessage] = useState("");
  const [editTemperature, setEditTemperature] = useState(0.7);
  const [editMaxTurns, setEditMaxTurns] = useState(50);
  const [editLlmModel, setEditLlmModel] = useState("claude-sonnet-4");

  // Voice editing state
  const [editVoiceId, setEditVoiceId] = useState("");
  const [editVoiceGender, setEditVoiceGender] = useState("");
  const [editLanguage, setEditLanguage] = useState("en");
  const [editVoiceSettings, setEditVoiceSettings] = useState({
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0,
    speed: 1,
  });
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [voiceExpanded, setVoiceExpanded] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch voices when voice section is expanded
  useEffect(() => {
    if (!voiceExpanded || voices.length > 0) return;
    async function fetchVoices() {
      setLoadingVoices(true);
      try {
        const res = await fetch("/api/voices");
        if (res.ok) {
          const data = await res.json();
          if (data.voices?.length > 0) setVoices(data.voices);
        }
      } catch { /* ignore */ } finally {
        setLoadingVoices(false);
      }
    }
    fetchVoices();
  }, [voiceExpanded, voices.length]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayPreview = (voice: VoiceOption) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (playingVoiceId === voice.voice_id) {
      setPlayingVoiceId(null);
      return;
    }
    const src = voice.preview_url || `/api/voices/${voice.voice_id}/preview`;
    const audio = new Audio(src);
    audioRef.current = audio;
    setPlayingVoiceId(voice.voice_id);
    audio.play().catch(() => setPlayingVoiceId(null));
    audio.onended = () => { setPlayingVoiceId(null); audioRef.current = null; };
    audio.onerror = () => { setPlayingVoiceId(null); audioRef.current = null; };
  };

  const filteredVoices = voices.filter((v) => {
    const gender = v.labels?.gender?.toLowerCase();
    if (genderFilter !== "all" && gender !== genderFilter) return false;
    return true;
  });

  useEffect(() => {
    async function fetchAgent() {
      try {
        const res = await fetch(`/api/agents/${agentId}`);
        if (res.ok) {
          const data = await res.json();
          setAgent(data);
          // Populate editable fields
          setEditName(data.name || "");
          setEditDescription(data.description || "");
          setEditSystemPrompt(data.system_prompt || "");
          setEditFirstMessage(data.first_message || "");
          setEditTemperature(data.temperature ?? 0.7);
          setEditMaxTurns(data.max_turns ?? 50);
          setEditLlmModel(data.llm_model || "claude-sonnet-4");
          setEditVoiceId(data.voice_id || "");
          setEditVoiceGender(data.voice_gender || "");
          setEditLanguage(data.language || "en");
          if (data.voice_settings) {
            setEditVoiceSettings({
              stability: data.voice_settings.stability ?? 0.5,
              similarity_boost: data.voice_settings.similarity_boost ?? 0.75,
              style: data.voice_settings.style ?? 0,
              speed: data.voice_settings.speed ?? 1,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch agent:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAgent();
  }, [agentId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          system_prompt: editSystemPrompt,
          first_message: editFirstMessage,
          temperature: editTemperature,
          max_turns: editMaxTurns,
          llm_model: editLlmModel,
          voice_id: editVoiceId,
          voice_gender: editVoiceGender,
          language: editLanguage,
          voice_settings: editVoiceSettings,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAgent(updated);
        toast.success("Agent saved successfully");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to save agent");
      }
    } catch (error) {
      console.error("Failed to save agent:", error);
      toast.error("Failed to save agent");
    } finally {
      setSaving(false);
    }
  };

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const res = await fetch(`/api/agents/${agentId}/deploy`, {
        method: "POST",
      });
      if (res.ok) {
        const updated = await res.json();
        setAgent((prev) =>
          prev ? { ...prev, status: "active", ...updated } : prev
        );
        toast.success("Agent deployed successfully");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to deploy agent");
      }
    } catch (error) {
      console.error("Failed to deploy agent:", error);
      toast.error("Failed to deploy agent");
    } finally {
      setDeploying(false);
    }
  };

  const handlePause = async () => {
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paused" }),
      });
      if (res.ok) {
        setAgent((prev) => (prev ? { ...prev, status: "paused" } : prev));
        toast.success("Agent paused");
      } else {
        toast.error("Failed to pause agent");
      }
    } catch (error) {
      console.error("Failed to pause agent:", error);
      toast.error("Failed to pause agent");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Agent deleted");
        router.push("/agents");
      } else {
        toast.error("Failed to delete agent");
      }
    } catch (error) {
      console.error("Failed to delete agent:", error);
      toast.error("Failed to delete agent");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground">Agent not found</p>
        <Button asChild variant="outline">
          <Link href="/agents">Back to Agents</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/agents">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{agent.name}</h1>
              <Badge
                variant={STATUS_VARIANTS[agent.status] || "secondary"}
              >
                {agent.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {DOMAIN_LABELS[agent.domain] || agent.domain} &middot;{" "}
              {agent.agent_type?.replace(/_/g, " ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {agent.status === "active" ? (
            <Button variant="outline" size="sm" onClick={handlePause}>
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleDeploy}
              disabled={deploying}
            >
              {deploying ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Rocket className="h-4 w-4 mr-1" />
              )}
              {deploying ? "Deploying..." : "Deploy"}
            </Button>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex gap-3 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/agents/${agentId}/test`}>
            <MessageSquare className="h-4 w-4 mr-1" />
            Test Agent
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/agents/${agentId}/knowledge`}>
            <BookOpen className="h-4 w-4 mr-1" />
            Knowledge Base
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/agents/${agentId}/integrations`}>
            <Share2 className="h-4 w-4 mr-1" />
            Integrations
          </Link>
        </Button>
        {agent.elevenlabs_agent_id && (
          <Button variant="outline" size="sm" asChild>
            <a
              href={`https://elevenlabs.io/app/conversational-ai/${agent.elevenlabs_agent_id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Voice Provider
            </a>
          </Button>
        )}
      </div>

      {/* Editable Configuration */}
      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
            <CardDescription>
              Update your agent&apos;s name and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Agent Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Persona */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Persona</CardTitle>
            <CardDescription>
              Manage the agent&apos;s system prompt and first message
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-first-message">First Message</Label>
              <Textarea
                id="edit-first-message"
                value={editFirstMessage}
                onChange={(e) => setEditFirstMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-system-prompt">System Prompt</Label>
              <Textarea
                id="edit-system-prompt"
                value={editSystemPrompt}
                onChange={(e) => setEditSystemPrompt(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            {agent.personality_traits && (
              <div>
                <Label>Personality Traits</Label>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {agent.personality_traits.traits?.map((trait) => (
                    <Badge
                      key={trait}
                      variant="secondary"
                      className="capitalize"
                    >
                      {trait}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Response style:{" "}
                  <span className="capitalize">
                    {agent.personality_traits.response_style}
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Model Settings</CardTitle>
            <CardDescription>
              Configure the LLM model and generation parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-model">LLM Model</Label>
              <Select
                value={editLlmModel}
                onValueChange={setEditLlmModel}
              >
                <SelectTrigger id="edit-model" className="max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="text-xs font-semibold text-primary">Anthropic Claude</SelectLabel>
                    <SelectItem value="claude-sonnet-4-5">Claude Sonnet 4.5 (Latest)</SelectItem>
                    <SelectItem value="claude-sonnet-4">Claude Sonnet 4 (Recommended)</SelectItem>
                    <SelectItem value="claude-haiku-4-5">Claude Haiku 4.5 (Fast)</SelectItem>
                    <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="text-xs font-semibold text-primary">OpenAI GPT</SelectLabel>
                    <SelectItem value="gpt-4o">GPT-4o (Multimodal)</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast)</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Budget)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="text-xs font-semibold text-primary">Google Gemini</SelectLabel>
                    <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash (Latest)</SelectItem>
                    <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                    <SelectItem value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</SelectItem>
                    <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                    <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="text-xs font-semibold text-primary">DeepSeek (Custom LLM)</SelectLabel>
                    <SelectItem value="custom-llm">DeepSeek R1 (Custom Integration)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-temperature">Temperature</Label>
                <Input
                  id="edit-temperature"
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={editTemperature}
                  onChange={(e) =>
                    setEditTemperature(parseFloat(e.target.value) || 0.7)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-max-turns">Max Turns</Label>
                <Input
                  id="edit-max-turns"
                  type="number"
                  min={1}
                  max={100}
                  value={editMaxTurns}
                  onChange={(e) =>
                    setEditMaxTurns(parseInt(e.target.value) || 50)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Configuration (Editable) */}
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => setVoiceExpanded(!voiceExpanded)}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Voice Configuration</CardTitle>
                <CardDescription>
                  {voiceExpanded
                    ? "Select a voice, language, and fine-tune voice settings"
                    : `${voices.find(v => v.voice_id === editVoiceId)?.name || editVoiceId || "Not set"} · ${LANGUAGES.find(l => l.value === editLanguage)?.label || editLanguage} · ${editVoiceSettings.speed}x speed`}
                </CardDescription>
              </div>
              {voiceExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>

          {voiceExpanded && (
            <CardContent className="space-y-6">
              {/* Language */}
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={editLanguage} onValueChange={setEditLanguage}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Voice</Label>
                  {loadingVoices && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading voices...
                    </div>
                  )}
                </div>

                {/* Gender filter */}
                <div className="flex gap-1.5">
                  {[
                    { value: "all", label: "All" },
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={genderFilter === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGenderFilter(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
                  {filteredVoices.map((voice) => {
                    const isSelected = editVoiceId === voice.voice_id;
                    const isPlaying = playingVoiceId === voice.voice_id;

                    return (
                      <Card
                        key={voice.voice_id}
                        className={cn(
                          "relative cursor-pointer transition-all hover:shadow-md",
                          isSelected
                            ? "border-primary border-2"
                            : "hover:border-primary/50"
                        )}
                        onClick={() => {
                          setEditVoiceId(voice.voice_id);
                          if (voice.labels?.gender) {
                            setEditVoiceGender(voice.labels.gender);
                          }
                        }}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground">
                              <Check className="h-3 w-3" />
                            </div>
                          </div>
                        )}
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm truncate">
                                  {voice.name}
                                </h4>
                                {voice.recommended && (
                                  <Badge
                                    variant="secondary"
                                    className="shrink-0 bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0"
                                  >
                                    <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                                    Best
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground capitalize mt-0.5">
                                {voice.labels?.gender || ""}
                                {voice.labels?.accent ? ` · ${voice.labels.accent}` : ""}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayPreview(voice);
                              }}
                            >
                              {isPlaying ? (
                                <Square className="h-3.5 w-3.5" />
                              ) : (
                                <Play className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Voice Settings Sliders */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Voice Settings</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Stability</Label>
                      <span className="text-sm text-muted-foreground font-mono">
                        {editVoiceSettings.stability.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[editVoiceSettings.stability]}
                      onValueChange={([v]) =>
                        setEditVoiceSettings((s) => ({ ...s, stability: v }))
                      }
                      min={0} max={1} step={0.01}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Similarity Boost</Label>
                      <span className="text-sm text-muted-foreground font-mono">
                        {editVoiceSettings.similarity_boost.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[editVoiceSettings.similarity_boost]}
                      onValueChange={([v]) =>
                        setEditVoiceSettings((s) => ({ ...s, similarity_boost: v }))
                      }
                      min={0} max={1} step={0.01}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Style</Label>
                      <span className="text-sm text-muted-foreground font-mono">
                        {editVoiceSettings.style.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[editVoiceSettings.style]}
                      onValueChange={([v]) =>
                        setEditVoiceSettings((s) => ({ ...s, style: v }))
                      }
                      min={0} max={1} step={0.01}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Speed</Label>
                      <span className="text-sm text-muted-foreground font-mono">
                        {editVoiceSettings.speed.toFixed(2)}x
                      </span>
                    </div>
                    <Slider
                      value={[editVoiceSettings.speed]}
                      onValueChange={([v]) =>
                        setEditVoiceSettings((s) => ({ ...s, speed: v }))
                      }
                      min={0.5} max={2} step={0.05}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Save / Delete */}
        <div className="flex items-center justify-between pt-4">
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Agent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Agent</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;{agent.name}&quot;? This
                  action cannot be undone. All associated conversations,
                  knowledge base items, and configurations will be permanently
                  removed.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  {deleting ? "Deleting..." : "Delete Agent"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
