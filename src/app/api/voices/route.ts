import { NextResponse } from "next/server";
import { listVoices } from "@/lib/elevenlabs";
import type { VoiceOption } from "@/types";

// Curated conversational voices — best for phone calls and AI agents
// These are officially recommended by ElevenLabs for conversational AI
const CONVERSATIONAL_VOICE_IDS = new Set([
  "kdmDKE6EkgrWrrykO9Qt", // Alexandra
  "L0Dsvb3SLTyegXwtm47J", // Archer
  "g6xIsTj2HwM6VR4iXFCw", // Jessica Anne Bogart
  "OYTbf65OHHFELVut7v2H", // Hope
  "dj3G1R1ilKoFKhBnWOzG", // Eryn
  "HDA9tsk27wYi3uq0fPcK", // Stuart
  "1SM7GgM6IMuvQlz2BwM3", // Mark
  "PT4nqlKZfc06VW1BuClj", // Angela
  "vBKc2FfBKJfcZNyEt1n6", // Finn
  "56AoDkrOh6qfVPDXZ7Pt", // Cassidy
  "iP95p4xoKVk53GoZ742B", // Chris
  "cgSgspJ2msm6clMCkdW9", // Jessica
  "cjVigY5qzO86Huf0OWal", // Eric
  "EXAVITQu4vr4xnSDxMaL", // Sarah
  "XrExE9yKIg1WjnnlVkGX", // Matilda
  "IKne3meq5aSn9XLyUdCD", // Charlie
  "9BWtsMINqrJLrRacOk9x", // Aria
  "21m00Tcm4TlvDq8ikWAM", // Rachel
  "FGY2WhTYpPnrIDTdsKH5", // Laura
  "bIHbv24MWmeRgasZH58o", // Will
]);

// Fallback voices if ElevenLabs API is unavailable
const FALLBACK_VOICES: VoiceOption[] = [
  // ── Recommended for conversations (Tier 1) ──
  {
    voice_id: "cgSgspJ2msm6clMCkdW9",
    name: "Jessica",
    category: "conversational",
    labels: { accent: "American", gender: "female", age: "young", use_case: "conversational" },
    preview_url: "",
    description: "Expressive, conversational, youthful — top default voice",
    recommended: true,
  },
  {
    voice_id: "cjVigY5qzO86Huf0OWal",
    name: "Eric",
    category: "conversational",
    labels: { accent: "American", gender: "male", age: "middle-aged", use_case: "conversational" },
    preview_url: "",
    description: "Friendly, approachable — ideal for customer service",
    recommended: true,
  },
  {
    voice_id: "iP95p4xoKVk53GoZ742B",
    name: "Chris",
    category: "conversational",
    labels: { accent: "American", gender: "male", age: "middle-aged", use_case: "conversational" },
    preview_url: "",
    description: "Casual, easy going — most natural-sounding male voice",
    recommended: true,
  },
  {
    voice_id: "EXAVITQu4vr4xnSDxMaL",
    name: "Sarah",
    category: "conversational",
    labels: { accent: "American", gender: "female", age: "young", use_case: "conversational" },
    preview_url: "",
    description: "Soft, expressive — warm and professional",
    recommended: true,
  },
  {
    voice_id: "9BWtsMINqrJLrRacOk9x",
    name: "Aria",
    category: "conversational",
    labels: { accent: "American", gender: "female", age: "young", use_case: "conversational" },
    preview_url: "",
    description: "Expressive, engaging — calm with natural rasp",
    recommended: true,
  },
  {
    voice_id: "L0Dsvb3SLTyegXwtm47J",
    name: "Archer",
    category: "conversational",
    labels: { accent: "British", gender: "male", age: "young", use_case: "conversational" },
    preview_url: "",
    description: "Grounded, charming — professional yet warm British male",
    recommended: true,
  },
  {
    voice_id: "OYTbf65OHHFELVut7v2H",
    name: "Hope",
    category: "conversational",
    labels: { accent: "American", gender: "female", age: "young", use_case: "conversational" },
    preview_url: "",
    description: "Bright, uplifting — perfect for positive interactions",
    recommended: true,
  },
  {
    voice_id: "dj3G1R1ilKoFKhBnWOzG",
    name: "Eryn",
    category: "conversational",
    labels: { accent: "American", gender: "female", age: "young", use_case: "conversational" },
    preview_url: "",
    description: "Friendly, relatable — ideal for casual interactions",
    recommended: true,
  },
  {
    voice_id: "1SM7GgM6IMuvQlz2BwM3",
    name: "Mark",
    category: "conversational",
    labels: { accent: "American", gender: "male", age: "middle-aged", use_case: "conversational" },
    preview_url: "",
    description: "Relaxed, laid back — natural low-pressure tone",
    recommended: true,
  },
  {
    voice_id: "PT4nqlKZfc06VW1BuClj",
    name: "Angela",
    category: "conversational",
    labels: { accent: "American", gender: "female", age: "middle-aged", use_case: "conversational" },
    preview_url: "",
    description: "Raw, relatable — excellent empathetic customer service",
    recommended: true,
  },
  // ── Additional quality voices ──
  {
    voice_id: "XrExE9yKIg1WjnnlVkGX",
    name: "Matilda",
    category: "premade",
    labels: { accent: "American", gender: "female", age: "middle-aged", use_case: "narration" },
    preview_url: "",
    description: "Friendly, calm — warm alto pitch for advisory roles",
  },
  {
    voice_id: "21m00Tcm4TlvDq8ikWAM",
    name: "Rachel",
    category: "premade",
    labels: { accent: "American", gender: "female", age: "young", use_case: "narration" },
    preview_url: "",
    description: "Calm, natural — the original ElevenLabs classic",
  },
  {
    voice_id: "IKne3meq5aSn9XLyUdCD",
    name: "Charlie",
    category: "conversational",
    labels: { accent: "Australian", gender: "male", age: "middle-aged", use_case: "conversational" },
    preview_url: "",
    description: "Natural, relaxed — great conversational Australian voice",
  },
  {
    voice_id: "HDA9tsk27wYi3uq0fPcK",
    name: "Stuart",
    category: "conversational",
    labels: { accent: "Australian", gender: "male", age: "middle-aged", use_case: "conversational" },
    preview_url: "",
    description: "Professional, friendly Aussie — great for tech support",
  },
  {
    voice_id: "FGY2WhTYpPnrIDTdsKH5",
    name: "Laura",
    category: "premade",
    labels: { accent: "American", gender: "female", age: "young", use_case: "social" },
    preview_url: "",
    description: "Upbeat, lively — approachable and energetic",
  },
  {
    voice_id: "bIHbv24MWmeRgasZH58o",
    name: "Will",
    category: "premade",
    labels: { accent: "American", gender: "male", age: "middle-aged", use_case: "narration" },
    preview_url: "",
    description: "Natural, steady — reliable professional tone",
  },
  {
    voice_id: "vBKc2FfBKJfcZNyEt1n6",
    name: "Finn",
    category: "conversational",
    labels: { accent: "American", gender: "male", age: "young", use_case: "conversational" },
    preview_url: "",
    description: "Natural tenor — excels in podcast and conversational contexts",
  },
  {
    voice_id: "56AoDkrOh6qfVPDXZ7Pt",
    name: "Cassidy",
    category: "conversational",
    labels: { accent: "American", gender: "female", age: "young", use_case: "conversational" },
    preview_url: "",
    description: "Engaging, energetic — great for upbeat interactions",
  },
  {
    voice_id: "g6xIsTj2HwM6VR4iXFCw",
    name: "Jessica Anne Bogart",
    category: "conversational",
    labels: { accent: "American", gender: "female", age: "middle-aged", use_case: "conversational" },
    preview_url: "",
    description: "Empathetic, expressive — ideal for advisory and support",
    recommended: true,
  },
  {
    voice_id: "kdmDKE6EkgrWrrykO9Qt",
    name: "Alexandra",
    category: "conversational",
    labels: { accent: "American", gender: "female", age: "young", use_case: "conversational" },
    preview_url: "",
    description: "Super realistic — ElevenLabs' top recommendation for agents",
    recommended: true,
  },
];

// Cache the API response for 5 minutes
let cachedVoices: VoiceOption[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    const now = Date.now();

    // Return cached voices if still fresh
    if (cachedVoices && now - cacheTimestamp < CACHE_DURATION) {
      return NextResponse.json({ voices: cachedVoices }, {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=600",
        },
      });
    }

    // Fetch from ElevenLabs API
    const data = await listVoices();

    const voices: VoiceOption[] = (data.voices || []).map(
      (v: {
        voice_id: string;
        name: string;
        category?: string;
        labels?: Record<string, string>;
        preview_url?: string;
        description?: string;
      }) => ({
        voice_id: v.voice_id,
        name: v.name,
        category: v.category || "premade",
        labels: v.labels || {},
        preview_url: v.preview_url || "",
        description: v.description || "",
        recommended: CONVERSATIONAL_VOICE_IDS.has(v.voice_id),
      })
    );

    // Sort: recommended voices first, then alphabetical
    voices.sort((a, b) => {
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      return a.name.localeCompare(b.name);
    });

    // Update cache
    cachedVoices = voices;
    cacheTimestamp = now;

    return NextResponse.json({ voices }, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=600",
      },
    });
  } catch (error) {
    console.error("Failed to fetch voices from ElevenLabs:", error);
    // Return curated fallback voices if API is not available
    return NextResponse.json({ voices: FALLBACK_VOICES });
  }
}
