"use client";

import { useEffect, useState, useRef } from "react";
import { useAgentBuilderStore } from "@/stores/agent-builder-store";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Check, Play, Square, Loader2, Sparkles } from "lucide-react";
import type { VoiceOption } from "@/types";

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

const GENDER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export function StepVoice() {
  const {
    voiceId,
    voiceGender,
    language,
    voiceSettings,
    updateField,
  } = useAgentBuilderStore();

  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch voices from API
  useEffect(() => {
    async function fetchVoices() {
      setLoadingVoices(true);
      try {
        const res = await fetch("/api/voices");
        if (res.ok) {
          const data = await res.json();
          if (data.voices && data.voices.length > 0) {
            setVoices(data.voices);
          }
        }
      } catch {
        // Will show empty state
      } finally {
        setLoadingVoices(false);
      }
    }
    fetchVoices();
  }, []);

  // Filter voices by gender and recommended status
  const filteredVoices = voices.filter((v) => {
    const gender = v.labels?.gender?.toLowerCase();
    if (genderFilter !== "all" && gender !== genderFilter) return false;
    if (showRecommendedOnly && !v.recommended) return false;
    return true;
  });

  const recommendedCount = voices.filter((v) => v.recommended).length;
  const totalCount = voices.length;

  const handlePlayPreview = async (voice: VoiceOption) => {
    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (playingVoiceId === voice.voice_id) {
      setPlayingVoiceId(null);
      return;
    }

    // Try preview_url first, fall back to our TTS endpoint
    const previewSrc = voice.preview_url || `/api/voices/${voice.voice_id}/preview`;

    const audio = new Audio(previewSrc);
    audioRef.current = audio;
    setPlayingVoiceId(voice.voice_id);

    audio.play().catch(() => {
      setPlayingVoiceId(null);
    });

    audio.onended = () => {
      setPlayingVoiceId(null);
      audioRef.current = null;
    };

    audio.onerror = () => {
      setPlayingVoiceId(null);
      audioRef.current = null;
    };
  };

  const handleSelectVoice = (id: string) => {
    updateField("voiceId", id);
    // Also set gender from the selected voice
    const voice = voices.find((v) => v.voice_id === id);
    if (voice?.labels?.gender) {
      updateField("voiceGender", voice.labels.gender);
    }
  };

  const updateVoiceSetting = (
    key: keyof typeof voiceSettings,
    value: number
  ) => {
    updateField("voiceSettings", {
      ...voiceSettings,
      [key]: value,
    });
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-1">Voice Configuration</h2>
        <p className="text-sm text-muted-foreground">
          Choose a human-realistic voice for your AI agent. Recommended voices
          are optimized for natural phone conversations.
        </p>
      </div>

      {/* Language */}
      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Select
          value={language}
          onValueChange={(value) => updateField("language", value)}
        >
          <SelectTrigger id="language" className="w-full max-w-xs">
            <SelectValue placeholder="Select language" />
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

      {/* Voice Library */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>
            Voice Library <span className="text-destructive">*</span>
          </Label>
          {loadingVoices && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading voices...
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Gender filter */}
          <div className="flex gap-1.5">
            {GENDER_OPTIONS.map((option) => (
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

          {/* Recommended toggle */}
          <Button
            type="button"
            variant={showRecommendedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowRecommendedOnly(!showRecommendedOnly)}
            className="gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {showRecommendedOnly
              ? `Recommended (${recommendedCount})`
              : `All Voices (${totalCount})`}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
          {filteredVoices.map((voice) => {
            const isSelected = voiceId === voice.voice_id;
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
                onClick={() => handleSelectVoice(voice.voice_id)}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </div>
                  </div>
                )}
                <CardContent className="p-4">
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
                        {voice.labels?.accent
                          ? ` · ${voice.labels.accent}`
                          : ""}
                      </p>
                      {voice.description && (
                        <p className="text-[11px] text-muted-foreground/70 mt-1 line-clamp-2">
                          {voice.description}
                        </p>
                      )}
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

        {filteredVoices.length === 0 && !loadingVoices && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No voices found for the selected filters. Try adjusting your
            filters.
          </p>
        )}
        {!voiceId && filteredVoices.length > 0 && (
          <p className="text-xs text-destructive">
            Please select a voice to continue
          </p>
        )}
      </div>

      {/* Voice Settings */}
      <div className="space-y-6">
        <div>
          <Label className="text-base">Voice Settings</Label>
          <p className="text-xs text-muted-foreground mt-1">
            For natural conversations, keep stability at 0.4–0.6 and similarity
            at 0.5–0.75
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Stability */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Stability</Label>
              <span className="text-sm text-muted-foreground font-mono">
                {voiceSettings.stability.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[voiceSettings.stability]}
              onValueChange={([value]) =>
                updateVoiceSetting("stability", value)
              }
              min={0}
              max={1}
              step={0.01}
            />
            <p className="text-xs text-muted-foreground">
              Lower = more expressive variation, Higher = more consistent
            </p>
          </div>

          {/* Similarity Boost */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Similarity Boost</Label>
              <span className="text-sm text-muted-foreground font-mono">
                {voiceSettings.similarity_boost.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[voiceSettings.similarity_boost]}
              onValueChange={([value]) =>
                updateVoiceSetting("similarity_boost", value)
              }
              min={0}
              max={1}
              step={0.01}
            />
            <p className="text-xs text-muted-foreground">
              Higher values enhance clarity but may cause distortion above 0.8
            </p>
          </div>

          {/* Style */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Style</Label>
              <span className="text-sm text-muted-foreground font-mono">
                {voiceSettings.style.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[voiceSettings.style]}
              onValueChange={([value]) => updateVoiceSetting("style", value)}
              min={0}
              max={1}
              step={0.01}
            />
            <p className="text-xs text-muted-foreground">
              Higher values add more expressiveness to the voice
            </p>
          </div>

          {/* Speed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Speed</Label>
              <span className="text-sm text-muted-foreground font-mono">
                {voiceSettings.speed.toFixed(2)}x
              </span>
            </div>
            <Slider
              value={[voiceSettings.speed]}
              onValueChange={([value]) => updateVoiceSetting("speed", value)}
              min={0.5}
              max={2}
              step={0.05}
            />
            <p className="text-xs text-muted-foreground">
              0.9x–1.1x is the most natural range for conversations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
