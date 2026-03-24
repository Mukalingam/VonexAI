"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VonexLogo } from "@/components/ui/vonex-logo";

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      {/* Hamburger menu */}
      <Button variant="ghost" size="icon" onClick={onMenuToggle}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Logo */}
      <VonexLogo height={30} />

    </header>
  );
}
