import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Vonex AI",
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/signin");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("users")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const userData = {
    full_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
    avatar_url: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
    email: user.email,
  };

  return <DashboardShell user={userData}>{children}</DashboardShell>;
}
