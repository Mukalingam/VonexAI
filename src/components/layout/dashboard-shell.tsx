"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  user: {
    full_name: string | null;
    avatar_url: string | null;
    email?: string;
  };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background">
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-[280px]">
        <TopBar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="min-h-[calc(100vh-3.5rem)] p-6 lg:min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
