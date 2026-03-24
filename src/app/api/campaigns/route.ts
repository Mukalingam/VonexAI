import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { campaignCreateSchema } from "@/lib/validations";

// GET /api/campaigns - List campaigns
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
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = (page - 1) * limit;

    let query = supabase
      .from("campaigns")
      .select("*, agent:agents(id, name, elevenlabs_agent_id, status), phone_number:phone_numbers(id, phone_number, friendly_name)", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: campaigns, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching campaigns:", error);
      return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
    }

    return NextResponse.json({
      campaigns: campaigns || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error in GET /api/campaigns:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/campaigns - Create campaign
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

    const body = await request.json();
    const parsed = campaignCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, agent_id, phone_number_id, contacts, settings } = parsed.data;

    // Verify agent ownership and deployment
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id, elevenlabs_agent_id, status")
      .eq("id", agent_id)
      .eq("user_id", user.id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (!agent.elevenlabs_agent_id) {
      return NextResponse.json(
        { error: "Agent must be deployed to ElevenLabs before creating a campaign" },
        { status: 400 }
      );
    }

    // Verify phone number ownership
    const { data: phoneNumber, error: phoneError } = await supabase
      .from("phone_numbers")
      .select("id, elevenlabs_phone_number_id")
      .eq("id", phone_number_id)
      .eq("user_id", user.id)
      .single();

    if (phoneError || !phoneNumber) {
      return NextResponse.json({ error: "Phone number not found" }, { status: 404 });
    }

    if (!phoneNumber.elevenlabs_phone_number_id) {
      return NextResponse.json(
        { error: "Phone number must be imported to ElevenLabs" },
        { status: 400 }
      );
    }

    // Create campaign
    const { data: campaign, error: createError } = await supabase
      .from("campaigns")
      .insert({
        user_id: user.id,
        agent_id,
        phone_number_id,
        name,
        status: "draft",
        contacts,
        total_contacts: contacts.length,
        settings: settings || {},
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating campaign:", createError);
      return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
    }

    // Bulk-insert campaign_calls rows (one per contact)
    const campaignCalls = contacts.map((contact) => ({
      campaign_id: campaign.id,
      contact_phone: contact.phone,
      contact_name: contact.name || null,
      contact_variables: contact.variables || {},
      status: "pending",
    }));

    const { error: callsError } = await supabase
      .from("campaign_calls")
      .insert(campaignCalls);

    if (callsError) {
      console.error("Error creating campaign calls:", callsError);
      // Clean up the campaign if calls failed
      await supabase.from("campaigns").delete().eq("id", campaign.id);
      return NextResponse.json({ error: "Failed to create campaign contacts" }, { status: 500 });
    }

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/campaigns:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
