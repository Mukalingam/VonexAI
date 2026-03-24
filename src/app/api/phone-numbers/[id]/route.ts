import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  updateElevenLabsPhoneNumber,
  deleteElevenLabsPhoneNumber,
} from "@/lib/elevenlabs";

// PATCH /api/phone-numbers/[id] - Assign agent to phone number or update details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Get current phone number
    const { data: phoneNumber, error: fetchError } = await supabase
      .from("phone_numbers")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !phoneNumber) {
      return NextResponse.json(
        { error: "Phone number not found" },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = {};

    // Handle agent assignment
    if (body.agent_id !== undefined) {
      if (body.agent_id) {
        // Verify agent belongs to user
        const { data: agent } = await supabase
          .from("agents")
          .select("id, elevenlabs_agent_id")
          .eq("id", body.agent_id)
          .eq("user_id", user.id)
          .single();

        if (!agent) {
          return NextResponse.json(
            { error: "Agent not found" },
            { status: 404 }
          );
        }

        updates.agent_id = body.agent_id;
        updates.status = "assigned";

        // Update assignment in ElevenLabs if we have the IDs
        if (phoneNumber.elevenlabs_phone_number_id && agent.elevenlabs_agent_id) {
          try {
            await updateElevenLabsPhoneNumber(
              phoneNumber.elevenlabs_phone_number_id,
              { agent_id: agent.elevenlabs_agent_id }
            );
          } catch (err) {
            console.error("ElevenLabs phone number update failed:", err);
          }
        }
      } else {
        // Unassign agent
        updates.agent_id = null;
        updates.status = "available";

        if (phoneNumber.elevenlabs_phone_number_id) {
          try {
            await updateElevenLabsPhoneNumber(
              phoneNumber.elevenlabs_phone_number_id,
              { agent_id: "" }
            );
          } catch (err) {
            console.error("ElevenLabs phone number unassign failed:", err);
          }
        }
      }
    }

    if (typeof body.friendly_name === "string") {
      updates.friendly_name = body.friendly_name;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("phone_numbers")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*, agent:agents(id, name, domain, status)")
      .single();

    if (updateError) {
      console.error("Error updating phone number:", updateError);
      return NextResponse.json(
        { error: "Failed to update phone number" },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error in PATCH /api/phone-numbers/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/phone-numbers/[id] - Remove a phone number
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get phone number to find ElevenLabs ID
    const { data: phoneNumber } = await supabase
      .from("phone_numbers")
      .select("elevenlabs_phone_number_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number not found" },
        { status: 404 }
      );
    }

    // Delete from ElevenLabs first
    if (phoneNumber.elevenlabs_phone_number_id) {
      try {
        await deleteElevenLabsPhoneNumber(
          phoneNumber.elevenlabs_phone_number_id
        );
      } catch (err) {
        console.error("ElevenLabs phone number deletion failed:", err);
      }
    }

    // Delete from database
    const { error } = await supabase
      .from("phone_numbers")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting phone number:", error);
      return NextResponse.json(
        { error: "Failed to delete phone number" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/phone-numbers/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
