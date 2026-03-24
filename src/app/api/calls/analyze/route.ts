import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

interface TranscriptMessage {
  role: string;
  text: string;
  timestamp?: number;
}

interface CallAnalysis {
  sentiment: "positive" | "negative" | "neutral" | "mixed";
  sentiment_score: number; // -1 to 1
  lead_temperature: "hot" | "warm" | "cold";
  lead_score: number; // 0 to 100
  key_topics: string[];
  customer_intent: string;
  summary: string;
  action_items: string[];
  objections: string[];
  engagement_level: "high" | "medium" | "low";
}

// POST /api/calls/analyze - Analyze call transcripts using Claude AI
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let call_ids: string[] | undefined;
    let reanalyze: boolean | undefined;
    try {
      const body = await request.json();
      call_ids = body.call_ids;
      reanalyze = body.reanalyze;
    } catch {
      // Empty body is fine — analyze all unanalyzed calls
    }

    // Get calls to analyze
    let query = supabase
      .from("call_logs")
      .select("id, transcript, metadata, duration_seconds, direction, status, to_number, from_number, agent_id, agents(name)")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .not("transcript", "is", null);

    if (call_ids && call_ids.length > 0) {
      query = query.in("id", call_ids);
    } else {
      query = query.order("started_at", { ascending: false }).limit(50);
    }

    const { data: allCalls, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching calls:", fetchError);
      return NextResponse.json({ error: "Failed to fetch calls" }, { status: 500 });
    }

    // Filter out already-analyzed calls client-side (unless reanalyze)
    const calls = reanalyze
      ? allCalls
      : (allCalls || []).filter((c) => {
          const meta = c.metadata as Record<string, unknown> | null;
          return !meta?.ai_analyzed;
        });

    if (!calls || calls.length === 0) {
      return NextResponse.json({ message: "No calls to analyze", analyzed: 0 });
    }

    let analyzed = 0;

    for (const call of calls) {
      try {
        const transcript = call.transcript as TranscriptMessage[];
        if (!transcript || transcript.length < 2) continue;

        const conversationText = transcript
          .map((m: TranscriptMessage) => `${m.role === "agent" ? "Agent" : "Customer"}: ${m.text}`)
          .join("\n");

        const agentName = Array.isArray(call.agents)
          ? (call.agents as { name: string }[])[0]?.name
          : (call.agents as { name: string } | null)?.name;

        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: `Analyze this ${call.direction} phone call transcript between an AI agent${agentName ? ` (${agentName})` : ""} and a customer. Call duration: ${call.duration_seconds || 0} seconds.

Transcript:
${conversationText}

Respond ONLY with a JSON object (no markdown, no code fences):
{
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "sentiment_score": <number from -1.0 (very negative) to 1.0 (very positive)>,
  "lead_temperature": "hot" | "warm" | "cold",
  "lead_score": <number 0-100, where 100 = ready to buy/convert>,
  "key_topics": [<up to 5 main topics discussed>],
  "customer_intent": "<one line describing what the customer wants>",
  "summary": "<2-3 sentence call summary>",
  "action_items": [<follow-up actions needed>],
  "objections": [<any customer objections or concerns raised>],
  "engagement_level": "high" | "medium" | "low"
}

Lead temperature guide:
- "hot": Customer showed strong interest, asked about pricing/availability, ready to schedule visit/meeting, requested follow-up
- "warm": Customer was interested but non-committal, asked general questions, didn't reject the offer
- "cold": Customer was uninterested, gave short dismissive answers, ended call quickly, explicitly declined`,
            },
          ],
        });

        const textContent = response.content.find((c) => c.type === "text");
        if (!textContent || textContent.type !== "text") continue;

        let analysis: CallAnalysis;
        try {
          analysis = JSON.parse(textContent.text);
        } catch {
          // Try extracting JSON from the response
          const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) continue;
          analysis = JSON.parse(jsonMatch[0]);
        }

        // Update call_logs with AI analysis
        const existingMetadata = (call.metadata as Record<string, unknown>) || {};
        await supabase
          .from("call_logs")
          .update({
            metadata: {
              ...existingMetadata,
              ai_analyzed: true,
              ai_analysis: analysis,
            },
            sentiment_score: analysis.sentiment_score,
          })
          .eq("id", call.id);

        analyzed++;
      } catch (analyzeErr) {
        console.error(`Failed to analyze call ${call.id}:`, analyzeErr);
      }
    }

    return NextResponse.json({
      message: `Analyzed ${analyzed} calls`,
      analyzed,
      total: calls.length,
    });
  } catch (error) {
    console.error("Error in POST /api/calls/analyze:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/calls/analyze - Get analysis results for dashboard
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    // Get all completed calls and filter for analyzed ones client-side
    const { data: allCalls } = await supabase
      .from("call_logs")
      .select("id, metadata, sentiment_score, duration_seconds, direction, status, to_number, from_number, started_at, agent_id, agents(name)")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("started_at", dateFrom.toISOString())
      .order("started_at", { ascending: false });

    const calls = (allCalls || []).filter((c) => {
      const meta = c.metadata as Record<string, unknown> | null;
      return meta?.ai_analyzed === true;
    });

    if (!calls || calls.length === 0) {
      return NextResponse.json({
        analyzed_calls: 0,
        sentiment_distribution: [],
        lead_distribution: [],
        hot_leads: [],
        cold_leads: [],
        avg_sentiment: 0,
        avg_lead_score: 0,
        top_topics: [],
        engagement_distribution: [],
      });
    }

    // Aggregate analytics
    const sentimentCount: Record<string, number> = {};
    const leadCount: Record<string, number> = {};
    const engagementCount: Record<string, number> = {};
    const topicCount: Record<string, number> = {};
    let totalSentiment = 0;
    let totalLeadScore = 0;
    const hotLeads: Array<{
      id: string;
      to_number: string | null;
      from_number: string | null;
      agent_name: string | null;
      lead_score: number;
      summary: string;
      started_at: string;
      contact_name?: string;
    }> = [];
    const coldLeads: Array<{
      id: string;
      to_number: string | null;
      from_number: string | null;
      agent_name: string | null;
      lead_score: number;
      summary: string;
      started_at: string;
      contact_name?: string;
    }> = [];

    for (const call of calls) {
      const meta = call.metadata as Record<string, unknown>;
      const analysis = meta?.ai_analysis as CallAnalysis;
      if (!analysis) continue;

      const agentName = Array.isArray(call.agents)
        ? (call.agents as { name: string }[])[0]?.name
        : (call.agents as { name: string } | null)?.name;

      // Sentiment
      sentimentCount[analysis.sentiment] = (sentimentCount[analysis.sentiment] || 0) + 1;
      totalSentiment += analysis.sentiment_score || 0;

      // Lead temperature
      leadCount[analysis.lead_temperature] = (leadCount[analysis.lead_temperature] || 0) + 1;
      totalLeadScore += analysis.lead_score || 0;

      // Engagement
      engagementCount[analysis.engagement_level] = (engagementCount[analysis.engagement_level] || 0) + 1;

      // Topics
      (analysis.key_topics || []).forEach((topic: string) => {
        topicCount[topic] = (topicCount[topic] || 0) + 1;
      });

      const callInfo = {
        id: call.id,
        to_number: call.to_number,
        from_number: call.from_number,
        agent_name: agentName || null,
        lead_score: analysis.lead_score,
        summary: analysis.summary,
        started_at: call.started_at,
        contact_name: (meta?.contact_name as string) || undefined,
      };

      if (analysis.lead_temperature === "hot") hotLeads.push(callInfo);
      if (analysis.lead_temperature === "cold") coldLeads.push(callInfo);
    }

    return NextResponse.json({
      analyzed_calls: calls.length,
      sentiment_distribution: Object.entries(sentimentCount).map(([sentiment, count]) => ({
        sentiment,
        count,
      })),
      lead_distribution: Object.entries(leadCount).map(([temperature, count]) => ({
        temperature,
        count,
      })),
      engagement_distribution: Object.entries(engagementCount).map(([level, count]) => ({
        level,
        count,
      })),
      hot_leads: hotLeads.sort((a, b) => b.lead_score - a.lead_score).slice(0, 10),
      cold_leads: coldLeads.slice(0, 10),
      avg_sentiment: calls.length > 0 ? parseFloat((totalSentiment / calls.length).toFixed(2)) : 0,
      avg_lead_score: calls.length > 0 ? Math.round(totalLeadScore / calls.length) : 0,
      top_topics: Object.entries(topicCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([topic, count]) => ({ topic, count })),
    });
  } catch (error) {
    console.error("Error in GET /api/calls/analyze:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
