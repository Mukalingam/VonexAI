"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Check,
  Zap,
  Bot,
  HardDrive,
  Crown,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User, PlanTier } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PlanConfig {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limits: {
    agents: number;
    apiCalls: number;
    storage: string;
  };
  highlighted?: boolean;
}

const plans: Record<PlanTier, PlanConfig> = {
  free: {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started and experimenting",
    features: [
      "Up to 3 agents",
      "1,000 API calls/month",
      "100MB storage",
      "Community support",
      "Basic analytics",
      "Standard voices",
    ],
    limits: {
      agents: 3,
      apiCalls: 1000,
      storage: "100MB",
    },
  },
  pro: {
    name: "Pro",
    price: "$49",
    period: "per month",
    description: "For professionals building production voice agents",
    features: [
      "Up to 25 agents",
      "50,000 API calls/month",
      "5GB storage",
      "Priority support",
      "Advanced analytics",
      "Premium voices",
      "Custom domains",
      "Webhook integrations",
    ],
    limits: {
      agents: 25,
      apiCalls: 50000,
      storage: "5GB",
    },
    highlighted: true,
  },
  enterprise: {
    name: "Enterprise",
    price: "Custom",
    period: "per month",
    description: "For organizations with advanced needs and compliance",
    features: [
      "Unlimited agents",
      "Unlimited API calls",
      "50GB storage",
      "Dedicated support",
      "Custom analytics",
      "All premium voices",
      "Custom domains",
      "Webhook integrations",
      "HIPAA compliance",
      "SSO / SAML",
      "SLA guarantee",
      "Custom voice cloning",
    ],
    limits: {
      agents: 999,
      apiCalls: 999999,
      storage: "50GB",
    },
  },
};

interface UsageMeterProps {
  icon: React.ReactNode;
  label: string;
  used: number;
  limit: number;
  unit?: string;
}

function UsageMeter({ icon, label, used, limit, unit }: UsageMeterProps) {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isNearLimit = percentage > 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {used.toLocaleString()} / {limit.toLocaleString()} {unit}
        </span>
      </div>
      <Progress
        value={percentage}
        className={cn(isNearLimit && "[&>div]:bg-amber-500")}
      />
      {isNearLimit && (
        <p className="text-xs text-amber-600">
          You are approaching your plan limit. Consider upgrading.
        </p>
      )}
    </div>
  );
}

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [agentCount, setAgentCount] = useState(0);

  useEffect(() => {
    async function loadBillingData() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/signin");
        return;
      }

      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      const { count } = await supabase
        .from("agents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setProfile(profileData);
      setAgentCount(count || 0);
      setLoading(false);
    }

    loadBillingData();
  }, [router]);

  const handleUpgrade = (plan: PlanTier) => {
    toast.info(
      `Upgrade to ${plans[plan].name} is coming soon. We will notify you when billing is available.`
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentPlan = (profile?.plan_tier as PlanTier) || "free";
  const currentPlanConfig = plans[currentPlan];
  const planLimits = currentPlanConfig.limits;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and monitor usage
        </p>
      </div>

      {/* Current Plan Card */}
      <Card className="border-[#2E3192]/20">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2E3192]/10">
                <Crown className="h-5 w-5 text-[#2E3192]" />
              </div>
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  You are currently on the{" "}
                  <span className="font-medium text-foreground">
                    {currentPlanConfig.name}
                  </span>{" "}
                  plan
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{currentPlanConfig.price}</p>
              <p className="text-sm text-muted-foreground">
                {currentPlanConfig.period}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Usage Meters */}
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>
            Current billing period usage and limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <UsageMeter
            icon={<Bot className="h-4 w-4 text-[#2E3192]" />}
            label="Agents"
            used={agentCount}
            limit={planLimits.agents}
          />
          <UsageMeter
            icon={<Zap className="h-4 w-4 text-amber-500" />}
            label="API Calls"
            used={profile?.api_calls_used || 0}
            limit={profile?.api_calls_limit || planLimits.apiCalls}
          />
          <UsageMeter
            icon={<HardDrive className="h-4 w-4 text-indigo-500" />}
            label="Storage"
            used={0}
            limit={
              parseInt(planLimits.storage) *
              (planLimits.storage.includes("GB") ? 1024 : 1)
            }
            unit="MB"
          />
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Compare Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {(Object.entries(plans) as [PlanTier, PlanConfig][]).map(
            ([tier, plan]) => {
              const isCurrent = tier === currentPlan;
              return (
                <Card
                  key={tier}
                  className={cn(
                    "relative flex flex-col",
                    plan.highlighted &&
                      "border-[#2E3192] shadow-lg shadow-[#2E3192]/10",
                    isCurrent && "ring-2 ring-[#2E3192]"
                  )}
                >
                  {plan.highlighted && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-[#2E3192] text-white hover:bg-[#2E3192]">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="outline" className="bg-background">
                        Current Plan
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">
                        {" "}
                        / {plan.period}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <Separator className="mb-4" />
                    <ul className="space-y-2.5">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {isCurrent ? (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : tier === "enterprise" ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleUpgrade(tier)}
                      >
                        Contact Sales
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        className={cn(
                          "w-full",
                          plan.highlighted &&
                            "bg-[#2E3192] hover:bg-[#2E3192]/90"
                        )}
                        onClick={() => handleUpgrade(tier)}
                      >
                        {currentPlan === "free" ? "Upgrade" : "Switch"} to{" "}
                        {plan.name}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            }
          )}
        </div>
      </div>

      {/* Payment Info Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
          <CardDescription>
            Manage your payment information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-medium">
              No payment method on file
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Payment integration is coming soon. You will be able to manage
              your payment methods and billing history here.
            </p>
            <Button variant="outline" size="sm" className="mt-4" disabled>
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
