"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonitorSmartphone, Phone, LayoutDashboard } from "lucide-react";
import { OverviewTab, type OverviewData } from "./overview-tab";
import { WebsiteAgentsTab, type WebsiteAgentsData } from "./website-agents-tab";
import { CallingAgentsTab, type CallingAgentsData } from "./calling-agents-tab";

interface DashboardTabsProps {
  overview: OverviewData;
  websiteData: WebsiteAgentsData;
  callingData: CallingAgentsData;
}

export function DashboardTabs({ overview, websiteData, callingData }: DashboardTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-6 grid w-full grid-cols-3 lg:w-[400px]">
        <TabsTrigger value="overview" className="gap-2">
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger value="website" className="gap-2">
          <MonitorSmartphone className="h-4 w-4" />
          <span className="hidden sm:inline">Website</span>
        </TabsTrigger>
        <TabsTrigger value="calling" className="gap-2">
          <Phone className="h-4 w-4" />
          <span className="hidden sm:inline">Calling</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab data={overview} />
      </TabsContent>

      <TabsContent value="website">
        <WebsiteAgentsTab data={websiteData} />
      </TabsContent>

      <TabsContent value="calling">
        <CallingAgentsTab data={callingData} />
      </TabsContent>
    </Tabs>
  );
}
