"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={0}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </TooltipProvider>
  );
}
