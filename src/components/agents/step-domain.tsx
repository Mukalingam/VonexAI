"use client";

import { useAgentBuilderStore } from "@/stores/agent-builder-store";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import {
  Stethoscope,
  TrendingUp,
  Headphones,
  GraduationCap,
  Building,
  Hotel,
  ShoppingCart,
  Settings,
  Car,
  Factory,
  Landmark,
  Scale,
  Truck,
  Shield,
  Wrench,
  Sun,
  Plane,
} from "lucide-react";
import { DOMAINS } from "@/lib/domains";
import type { AgentDomain } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Stethoscope,
  TrendingUp,
  Headphones,
  GraduationCap,
  Building,
  Hotel,
  ShoppingCart,
  Settings,
  Car,
  Factory,
  Landmark,
  Scale,
  Truck,
  Shield,
  Wrench,
  Sun,
  Plane,
};

export function StepDomain() {
  const { domain, agentType, updateField } = useAgentBuilderStore();

  const selectedConfig = DOMAINS.find((d) => d.id === domain);

  const handleDomainSelect = (domainId: AgentDomain) => {
    updateField("domain", domainId);
    // Reset agent type when domain changes
    const config = DOMAINS.find((d) => d.id === domainId);
    if (config && config.agentTypes.length > 0) {
      updateField("agentType", config.agentTypes[0].value);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-1">Select Domain</h2>
        <p className="text-sm text-muted-foreground">
          Choose the industry or use case for your AI voice agent
          <span className="text-destructive ml-1">*</span>
        </p>
      </div>

      {/* Domain Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {DOMAINS.map((config) => {
          const Icon = ICON_MAP[config.icon];
          const isSelected = domain === config.id;

          return (
            <Card
              key={config.id}
              className={cn(
                "relative cursor-pointer transition-all hover:shadow-md",
                isSelected
                  ? "border-primary border-2 shadow-md"
                  : "hover:border-primary/50"
              )}
              onClick={() => handleDomainSelect(config.id)}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                </div>
              )}
              <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-lg",
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {Icon && <Icon className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="font-medium text-sm">{config.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {config.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Agent Type Dropdown */}
      {selectedConfig && (
        <div className="space-y-2">
          <Label htmlFor="agent-type">Agent Type</Label>
          <Select
            value={agentType}
            onValueChange={(value) => updateField("agentType", value)}
          >
            <SelectTrigger id="agent-type" className="w-full max-w-md">
              <SelectValue placeholder="Select agent type" />
            </SelectTrigger>
            <SelectContent>
              {selectedConfig.agentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose the specific type of agent within the{" "}
            {selectedConfig.name.toLowerCase()} domain
          </p>
        </div>
      )}
    </div>
  );
}
