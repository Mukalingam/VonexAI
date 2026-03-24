import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validations";

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate the request body
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { full_name, company, timezone } = parsed.data;

    // Update the public.users table
    const { data: profile, error: updateError } = await supabase
      .from("users")
      .update({
        full_name,
        company,
        timezone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      // If the row doesn't exist yet, upsert it
      if (updateError.code === "PGRST116") {
        const { data: newProfile, error: insertError } = await supabase
          .from("users")
          .upsert({
            id: user.id,
            email: user.email,
            full_name,
            company,
            timezone,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          return NextResponse.json(
            { error: "Failed to create user profile" },
            { status: 500 }
          );
        }

        return NextResponse.json({ profile: newProfile });
      }

      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Also update the auth user metadata to keep it in sync
    await supabase.auth.updateUser({
      data: { full_name },
    });

    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
