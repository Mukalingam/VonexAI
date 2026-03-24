# Zentara — Technical Requirements Document (TRD)

**Version:** 1.0
**Date:** March 2, 2026
**Companion:** PRD_Zentara.md

---

## 1. Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          Zentara Architecture                              │
│                                                                            │
│  ┌───────────┐    ┌──────────────┐    ┌────────────────┐                  │
│  │  Next.js   │───▶│  API Routes   │───▶│ Vapi Server SDK │                 │
│  │  Frontend  │    │  (App Router) │    │ @vapi-ai/server │                 │
│  └───────────┘    └──────────────┘    └────────────────┘                  │
│       │                 │                      │                           │
│       │                 │                      ▼                           │
│       │                 │              ┌────────────────┐                  │
│       │                 │              │    Vapi API     │                  │
│       │                 │              │  (STT+LLM+TTS  │                  │
│       │                 │              │  Phone+Web+KB)  │                  │
│       │                 │              └────────────────┘                  │
│       │                 │                      │                           │
│       │                 ▼                      ▼                           │
│       │          ┌──────────────┐     ┌────────────────┐                  │
│       │          │   Supabase    │     │   Telephony     │                  │
│       │          │  (DB + Auth   │     │  (Twilio/SIP    │                  │
│       │          │   + Realtime) │     │   via Vapi)     │                  │
│       │          └──────────────┘     └────────────────┘                  │
│       │                                                                    │
│       ▼                                                                    │
│  ┌───────────┐    ┌──────────────┐    ┌────────────────┐                  │
│  │ Vapi Web  │    │  MCP Gateway  │    │ Workflow Engine │                  │
│  │   SDK     │    │  (Tool Proxy) │    │ (Event-Action)  │                  │
│  │ @vapi-ai  │    │              │    │                │                  │
│  │  /web     │    │ Zentara acts  │    │ Supabase Edge  │                  │
│  └───────────┘    │ as MCP client │    │ Functions or   │                  │
│                   │ for agents    │    │ API route      │                  │
│                   └──────────────┘    └────────────────┘                  │
└────────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Vapi as Unified Voice Backend** — All STT, LLM, TTS, phone, web, KB, and analytics flow through Vapi. No direct ElevenLabs/Twilio/Anthropic integration.

2. **Zentara as MCP Gateway** — Zentara's webhook endpoint acts as an MCP client. When Vapi fires a tool-call event, Zentara routes it to the appropriate MCP server (Google Calendar, HubSpot, etc.) and returns the result.

3. **Workflow Engine** — Event-driven system built on Supabase (database triggers + edge functions) or a dedicated workflow processor. Listens for webhook events from Vapi and executes action chains.

4. **Dual SDK** — `@vapi-ai/server-sdk` for API routes, `@vapi-ai/web` for browser widget.

5. **White-Label** — Custom widget wrapper, no Vapi branding anywhere.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (App Router, Turbopack) | Full-stack React |
| **Language** | TypeScript 5.x (strict) | Type safety |
| **Database** | Supabase (PostgreSQL 15) | Auth, RLS, Realtime |
| **Voice AI** | Vapi Server SDK v0.11+ | Assistant/call/phone/KB mgmt |
| **Web Voice** | @vapi-ai/web SDK | Browser voice widget |
| **MCP** | @modelcontextprotocol/sdk | MCP client for tool routing |
| **UI** | Tailwind CSS 4 + shadcn/ui | Components, theming |
| **Validation** | Zod | Schema validation |
| **Workflow** | Custom engine (Supabase + edge functions) | Event → action chains |
| **Icons** | Lucide React | Icon set |
| **Deployment** | Vercel | Edge, CDN, previews |

### Dependencies

```json
{
  "@vapi-ai/server-sdk": "^0.11.0",
  "@vapi-ai/web": "^2.x.x",
  "@modelcontextprotocol/sdk": "^1.x.x"
}
```

### Removed from v1
```json
{
  "@anthropic-ai/sdk": "removed",
  "elevenlabs": "removed (was src/lib/elevenlabs.ts)"
}
```

---

## 3. Design System — Amber + Charcoal

### 3.1 CSS Variables (globals.css)

```css
:root {
  /* Core */
  --background: 40 10% 98%;       /* #FAFAF9 warm white */
  --foreground: 24 10% 10%;       /* #1C1917 stone 900 */

  /* Primary — Amber */
  --primary: 38 92% 50%;          /* #F59E0B amber 500 */
  --primary-foreground: 0 0% 100%;

  /* Accent — Bronze */
  --accent: 28 80% 36%;           /* #B45309 amber 700 */
  --accent-foreground: 0 0% 100%;

  /* Secondary */
  --secondary: 30 6% 96%;         /* #F5F5F4 stone 100 */
  --secondary-foreground: 24 10% 10%;

  /* Muted */
  --muted: 30 6% 96%;
  --muted-foreground: 25 5% 45%;  /* #78716C stone 500 */

  /* Cards & Borders */
  --card: 0 0% 100%;
  --card-foreground: 24 10% 10%;
  --border: 24 6% 90%;            /* #E7E5E4 stone 200 */
  --input: 24 6% 90%;
  --ring: 38 92% 50%;             /* Amber focus ring */

  /* Destructive */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;

  /* Sidebar — Warm Charcoal */
  --sidebar-background: 24 10% 10%;  /* #1C1917 */
  --sidebar-foreground: 40 10% 98%;  /* #FAFAF9 */
  --sidebar-primary: 38 92% 50%;     /* Amber */
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 24 10% 14%;      /* #292524 stone 800 */
  --sidebar-accent-foreground: 40 10% 98%;
  --sidebar-border: 24 7% 18%;       /* #44403C stone 700 */
  --sidebar-ring: 38 92% 50%;

  /* Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --radius: 0.625rem;
}
```

### 3.2 Logo
The Zentara logo uses a stylized "Z" star icon in amber (#F59E0B) on dark backgrounds, or amber on white for light contexts. The wordmark uses Inter Bold with custom letter-spacing.

---

## 4. Environment Variables

```env
# Vapi
VAPI_API_KEY=              # Server-side private key
NEXT_PUBLIC_VAPI_PUBLIC_KEY= # Client-side public key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# MCP Integrations (OAuth credentials for pre-built connectors)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
HUBSPOT_CLIENT_ID=
HUBSPOT_CLIENT_SECRET=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=

# Email (for workflow actions)
SENDGRID_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://app.zentara.ai
```

---

## 5. Database Schema

### 5.1 Modified Tables

#### `agents` — Updated Columns

```sql
ALTER TABLE agents DROP COLUMN IF EXISTS elevenlabs_agent_id;

ALTER TABLE agents ADD COLUMN agent_channel TEXT NOT NULL DEFAULT 'website'
  CHECK (agent_channel IN ('website', 'calling'));
ALTER TABLE agents ADD COLUMN vapi_assistant_id TEXT;
ALTER TABLE agents ADD COLUMN vapi_squad_id TEXT;
ALTER TABLE agents ADD COLUMN voice_provider TEXT DEFAULT 'deepgram';
ALTER TABLE agents ADD COLUMN transcriber_provider TEXT DEFAULT 'deepgram';
ALTER TABLE agents ADD COLUMN widget_config JSONB DEFAULT '{}'::jsonb;
ALTER TABLE agents ADD COLUMN phone_config JSONB DEFAULT '{}'::jsonb;
ALTER TABLE agents ADD COLUMN analysis_plan JSONB DEFAULT '{}'::jsonb;
ALTER TABLE agents ADD COLUMN hooks JSONB DEFAULT '[]'::jsonb;
ALTER TABLE agents ADD COLUMN mcp_tools JSONB DEFAULT '[]'::jsonb;
```

**mcp_tools** schema:
```json
[
  {
    "connector_id": "uuid",
    "tool_name": "google_calendar_check_availability",
    "enabled": true,
    "config": { "calendar_id": "primary" }
  }
]
```

#### `call_logs` — Updated

```sql
ALTER TABLE call_logs DROP COLUMN IF EXISTS elevenlabs_conversation_id;
ALTER TABLE call_logs ADD COLUMN vapi_call_id TEXT;
ALTER TABLE call_logs ADD COLUMN call_type TEXT DEFAULT 'phone'
  CHECK (call_type IN ('phone', 'web'));
ALTER TABLE call_logs ADD COLUMN analysis JSONB DEFAULT '{}'::jsonb;
ALTER TABLE call_logs ADD COLUMN cost_breakdown JSONB DEFAULT '{}'::jsonb;
ALTER TABLE call_logs ADD COLUMN tool_calls JSONB DEFAULT '[]'::jsonb;
```

#### `phone_numbers` — Updated

```sql
ALTER TABLE phone_numbers DROP COLUMN IF EXISTS elevenlabs_phone_number_id;
ALTER TABLE phone_numbers DROP COLUMN IF EXISTS twilio_config_id;
ALTER TABLE phone_numbers ADD COLUMN vapi_phone_number_id TEXT;
ALTER TABLE phone_numbers ADD COLUMN provider TEXT DEFAULT 'vapi'
  CHECK (provider IN ('vapi', 'twilio', 'vonage', 'telnyx'));
```

### 5.2 New Tables

#### `squads`

```sql
CREATE TABLE squads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  vapi_squad_id TEXT,
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `mcp_connectors` (pre-built integration catalog)

```sql
CREATE TABLE mcp_connectors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,            -- 'google-calendar', 'hubspot'
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,               -- 'crm', 'calendar', 'ecommerce', etc.
  icon_url TEXT,
  auth_type TEXT DEFAULT 'oauth2'
    CHECK (auth_type IN ('oauth2', 'api_key', 'webhook', 'none')),
  oauth_config JSONB DEFAULT '{}'::jsonb,
  tools_schema JSONB NOT NULL,          -- MCP tool definitions
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `user_integrations` (user's connected accounts)

```sql
CREATE TABLE user_integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connector_id UUID NOT NULL REFERENCES mcp_connectors(id),
  access_token TEXT,                    -- encrypted
  refresh_token TEXT,                   -- encrypted
  token_expires_at TIMESTAMPTZ,
  config JSONB DEFAULT '{}'::jsonb,     -- user-specific settings
  status TEXT DEFAULT 'connected'
    CHECK (status IN ('connected', 'disconnected', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, connector_id)
);
```

#### `workflows`

```sql
CREATE TABLE workflows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,           -- 'call_ended', 'analysis_ready', 'keyword', 'schedule', etc.
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,  -- ordered action chain
  is_active BOOLEAN DEFAULT false,
  run_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**nodes** schema:
```json
[
  {
    "id": "node_1",
    "type": "condition",
    "config": {
      "field": "analysis.successEvaluation",
      "operator": "equals",
      "value": "true"
    },
    "on_true": "node_2",
    "on_false": "node_3"
  },
  {
    "id": "node_2",
    "type": "action",
    "action_type": "send_email",
    "config": {
      "to": "{{contact_email}}",
      "template": "call_success",
      "variables": { "summary": "{{analysis.summary}}" }
    }
  },
  {
    "id": "node_3",
    "type": "action",
    "action_type": "create_ticket",
    "connector_id": "zendesk-connector-uuid",
    "config": {
      "subject": "Follow-up needed: {{contact_name}}",
      "description": "{{analysis.summary}}"
    }
  }
]
```

#### `workflow_runs` (execution history)

```sql
CREATE TABLE workflow_runs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  call_log_id UUID REFERENCES call_logs(id),
  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'completed', 'failed')),
  trigger_data JSONB,
  execution_log JSONB DEFAULT '[]'::jsonb,  -- step-by-step results
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

#### `webhook_events`

```sql
CREATE TABLE webhook_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL,
  vapi_call_id TEXT,
  agent_id UUID REFERENCES agents(id),
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.3 Tables to Remove
- `twilio_configs` — Vapi manages phone providers

### 5.4 RLS Policies
All new tables get owner-based RLS:
- `squads`: user_id = auth.uid()
- `user_integrations`: user_id = auth.uid()
- `workflows`: user_id = auth.uid()
- `workflow_runs`: via workflow ownership
- `mcp_connectors`: public read (catalog), admin write
- `webhook_events`: system-only (service_role)

---

## 6. MCP Integration Layer

### 6.1 Architecture

```
Vapi Assistant (in-call)
  │ tool-call event: "check_calendar_availability"
  │
  ▼
POST /api/webhooks/vapi  (Zentara)
  │
  ├── Parse tool-call from event
  ├── Look up MCP connector + user integration
  ├── Load user's access token (decrypt)
  │
  ▼
Zentara MCP Client
  │
  ├── Connect to MCP server (Google Calendar)
  ├── Execute tool: calendar.checkAvailability({ date: "2026-03-05" })
  ├── Get result: { slots: ["10:00", "14:00", "16:00"] }
  │
  ▼
Return result to Vapi
  │
  └── Vapi passes result to LLM → agent speaks: "I have slots at 10, 2, and 4 PM"
```

### 6.2 MCP Gateway — `src/lib/mcp-gateway.ts`

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export async function executeMcpTool(params: {
  connectorSlug: string;
  toolName: string;
  toolArgs: Record<string, unknown>;
  userIntegration: UserIntegration;
}): Promise<unknown> {
  // 1. Resolve MCP server URL from connector config
  // 2. Create MCP client with user's auth credentials
  // 3. Call the tool
  // 4. Return result
}
```

### 6.3 Pre-Built Connector Implementation

For common integrations (Google Calendar, HubSpot, etc.), Zentara hosts its own MCP servers as Vercel Edge Functions:

```
/api/mcp/google-calendar   → MCP server exposing: checkAvailability, bookSlot, cancelEvent
/api/mcp/hubspot          → MCP server exposing: createContact, getContact, updateDeal
/api/mcp/slack            → MCP server exposing: sendMessage, createChannel
/api/mcp/shopify          → MCP server exposing: getOrder, trackShipment, processReturn
```

Each server implements the MCP specification and is registered as a Vapi tool via the webhook.

### 6.4 Custom MCP Servers
Users provide their own MCP server URL. Zentara:
1. Sends `initialize` request to discover capabilities
2. Presents available tools to user
3. User selects which tools to attach to their agent
4. During calls, Zentara proxies tool-calls to the custom server

---

## 7. Workflow Engine

### 7.1 Trigger System

```
Vapi Webhook Event (end-of-call-report, status-update, etc.)
  │
  ▼
POST /api/webhooks/vapi
  │
  ├── Process call data (update call_logs, etc.)
  │
  ├── Query workflows table:
  │   SELECT * FROM workflows
  │   WHERE agent_id = $1 AND is_active = true
  │   AND trigger_type = $2
  │
  ├── For each matching workflow:
  │   └── POST /api/workflows/execute  (async, non-blocking)
  │
  └── Return 200 to Vapi (< 200ms)
```

### 7.2 Execution Engine — `src/lib/workflow-engine.ts`

```typescript
export async function executeWorkflow(params: {
  workflowId: string;
  triggerData: Record<string, unknown>;
  callLog?: CallLog;
}) {
  // 1. Load workflow + nodes
  // 2. Create workflow_run record
  // 3. Walk through nodes sequentially:
  //    - Condition nodes: evaluate expression → branch
  //    - Action nodes: execute via MCP connector or built-in
  //    - Delay nodes: schedule continuation
  // 4. Log each step result in execution_log
  // 5. Mark run as completed/failed
}
```

### 7.3 Built-In Actions (no MCP needed)

| Action | Implementation |
|--------|---------------|
| Send Email | SendGrid API |
| Send SMS | Vapi/Twilio API |
| Call Webhook | fetch() to user URL |
| Add to Campaign | Supabase insert |
| Update Agent | Vapi assistant update |

### 7.4 Scheduled Workflows
For cron triggers (daily reports, etc.):
- Vercel Cron Jobs (`vercel.json` cron config)
- `/api/cron/workflows` — runs every minute, checks for due workflows
- Marks last_run_at after execution

---

## 8. API Routes

### 8.1 Existing Routes (Modified)

| Route | Changes |
|-------|---------|
| `/api/agents` | Add `agent_channel` filter; sync to Vapi on create |
| `/api/agents/[id]/deploy` | Create Vapi assistant; attach phone/widget config |
| `/api/calls` | Use `vapi.calls.create()`; add `call_type` filter |
| `/api/campaigns/[id]/launch` | Use `vapi.calls.create()` instead of ElevenLabs |
| `/api/phone-numbers` | Use Vapi phone API |

### 8.2 New Routes

| Route | Method | Purpose |
|-------|--------|---------|
| **Webhooks** | | |
| `/api/webhooks/vapi` | POST | Vapi event handler (all events) |
| **Squads** | | |
| `/api/squads` | GET/POST | List/create squads |
| `/api/squads/[id]` | GET/PATCH/DELETE | CRUD squad |
| `/api/squads/[id]/deploy` | POST | Create Vapi squad |
| **MCP / Integrations** | | |
| `/api/integrations` | GET | List available connectors + user status |
| `/api/integrations/[slug]/connect` | POST | Start OAuth flow / save API key |
| `/api/integrations/[slug]/disconnect` | POST | Revoke access |
| `/api/integrations/[slug]/test` | POST | Test tool execution |
| `/api/mcp/[slug]` | POST | MCP server endpoints (Google Cal, HubSpot, etc.) |
| **Workflows** | | |
| `/api/workflows` | GET/POST | List/create workflows |
| `/api/workflows/[id]` | GET/PATCH/DELETE | CRUD workflow |
| `/api/workflows/[id]/toggle` | POST | Enable/disable |
| `/api/workflows/[id]/runs` | GET | Execution history |
| `/api/workflows/execute` | POST | Internal: execute workflow (async) |
| **Analytics** | | |
| `/api/analytics/website` | GET | Web agent metrics |
| `/api/analytics/campaigns` | GET | Campaign aggregation |
| `/api/analytics/workflows` | GET | Workflow run stats |

### 8.3 Webhook Handler Logic

```
POST /api/webhooks/vapi
├── Verify X-Vapi-Signature
├── Parse event type
│
├── "end-of-call-report":
│   ├── Update call_logs (transcript, analysis, recording, cost)
│   ├── If campaign call → update campaign_call + campaign stats
│   ├── Trigger workflows (type: "call_ended")
│   └── If analysis present → trigger workflows (type: "analysis_ready")
│
├── "status-update":
│   ├── Update call_logs.status
│   └── Broadcast via Supabase Realtime
│
├── "tool-calls":
│   ├── For each tool call:
│   │   ├── If MCP tool → route to MCP gateway → return result
│   │   ├── If built-in tool → execute directly → return result
│   │   └── If custom webhook → forward to user URL → return result
│   └── Return tool results array to Vapi
│
├── "assistant-request":
│   ├── Look up agent by phone number
│   └── Return assistant config for inbound calls
│
├── "transcript":
│   └── Push to Supabase Realtime channel (live UI)
│
└── Store raw event in webhook_events table
```

---

## 9. Frontend Components

### 9.1 New Components

| Component | Path | Purpose |
|-----------|------|---------|
| `AgentTypeSelector` | `components/agents/agent-type-selector.tsx` | Website vs Calling card |
| `VoiceProviderSelector` | `components/agents/voice-provider-selector.tsx` | Multi-provider browser |
| `LlmModelSelector` | `components/agents/llm-model-selector.tsx` | Grouped picker |
| `WidgetConfigurator` | `components/agents/widget-configurator.tsx` | Widget settings + preview |
| `PhoneConfigurator` | `components/agents/phone-configurator.tsx` | Phone + voicemail setup |
| `HooksBuilder` | `components/agents/hooks-builder.tsx` | Visual hooks editor |
| `AnalysisPlanEditor` | `components/agents/analysis-plan-editor.tsx` | Analysis schema config |
| `McpToolSelector` | `components/agents/mcp-tool-selector.tsx` | Tool picker from connected integrations |
| `SquadBuilder` | `components/squads/squad-builder.tsx` | Visual canvas |
| `WorkflowBuilder` | `components/workflows/workflow-builder.tsx` | Drag-and-drop event→action |
| `WorkflowNodeEditor` | `components/workflows/node-editor.tsx` | Per-node config panel |
| `IntegrationCard` | `components/integrations/integration-card.tsx` | Connector marketplace card |
| `OAuthConnectButton` | `components/integrations/oauth-connect.tsx` | OAuth2 flow button |
| `VoiceWidget` | `components/voice/voice-widget.tsx` | White-labeled Vapi widget |
| `CallPlayer` | `components/calls/call-player.tsx` | Recording + transcript viewer |

### 9.2 White-Labeled Voice Widget

```typescript
// src/components/voice/voice-widget.tsx
"use client";
import Vapi from "@vapi-ai/web";

export function VoiceWidget({ assistantId, config }: VoiceWidgetProps) {
  const vapiRef = useRef<Vapi | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  useEffect(() => {
    const client = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
    client.on("call-start", () => setIsActive(true));
    client.on("call-end", () => setIsActive(false));
    client.on("message", (msg) => {
      if (msg.type === "transcript" && msg.transcriptType === "final") {
        setTranscript(prev => [...prev, { role: msg.role, text: msg.transcript }]);
      }
    });
    vapiRef.current = client;
    return () => { client.stop(); };
  }, []);

  // Renders a branded button + transcript panel
  // Uses config.primaryColor (default: #F59E0B amber)
  // No Vapi branding anywhere
}
```

### 9.3 Embeddable Script — `public/widget.js`
Self-contained script that loads `@vapi-ai/web` from CDN:
- Reads `data-agent-id`, `data-theme`, `data-position`, `data-primary-color` from `<script>` tag
- Creates shadow DOM container (isolation from host site CSS)
- Renders floating button + transcript panel
- No React dependency — vanilla JS + Vapi Web SDK

---

## 10. File Structure

### New Files
```
src/
├── lib/
│   ├── vapi.ts                              # Vapi SDK wrapper + mappers
│   ├── mcp-gateway.ts                       # MCP client + tool routing
│   └── workflow-engine.ts                   # Workflow execution logic
├── app/
│   ├── api/
│   │   ├── webhooks/vapi/route.ts           # Vapi event handler
│   │   ├── squads/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── deploy/route.ts
│   │   ├── integrations/
│   │   │   ├── route.ts                     # List connectors
│   │   │   └── [slug]/
│   │   │       ├── connect/route.ts         # OAuth / API key
│   │   │       ├── disconnect/route.ts
│   │   │       └── test/route.ts
│   │   ├── mcp/
│   │   │   ├── google-calendar/route.ts     # MCP server
│   │   │   ├── hubspot/route.ts
│   │   │   ├── slack/route.ts
│   │   │   └── shopify/route.ts
│   │   ├── workflows/
│   │   │   ├── route.ts
│   │   │   ├── execute/route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── toggle/route.ts
│   │   │       └── runs/route.ts
│   │   ├── analytics/
│   │   │   ├── website/route.ts
│   │   │   ├── campaigns/route.ts
│   │   │   └── workflows/route.ts
│   │   └── cron/
│   │       └── workflows/route.ts           # Scheduled workflow check
│   └── (dashboard)/
│       ├── squads/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx
│       ├── workflows/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx
│       └── integrations/
│           ├── page.tsx                     # MCP marketplace
│           └── [slug]/page.tsx              # Connector detail
├── components/
│   ├── agents/
│   │   ├── agent-type-selector.tsx
│   │   ├── voice-provider-selector.tsx
│   │   ├── llm-model-selector.tsx
│   │   ├── widget-configurator.tsx
│   │   ├── phone-configurator.tsx
│   │   ├── hooks-builder.tsx
│   │   ├── analysis-plan-editor.tsx
│   │   └── mcp-tool-selector.tsx
│   ├── squads/
│   │   └── squad-builder.tsx
│   ├── workflows/
│   │   ├── workflow-builder.tsx
│   │   └── node-editor.tsx
│   ├── integrations/
│   │   ├── integration-card.tsx
│   │   └── oauth-connect.tsx
│   ├── voice/
│   │   └── voice-widget.tsx
│   └── calls/
│       └── call-player.tsx
└── public/
    └── widget.js
```

### Modified Files
```
src/lib/elevenlabs.ts        → REMOVE
src/lib/anthropic.ts         → REMOVE
src/types/index.ts           → Add Squad, Workflow, McpConnector, UserIntegration types
src/lib/validations.ts       → Add squad, workflow, integration schemas
src/components/layout/sidebar.tsx → Add Workflows, Integrations nav
src/app/globals.css          → Amber + Charcoal color scheme
src/app/(dashboard)/agents/new/page.tsx → Add Step 0 + Step 7
src/app/(dashboard)/analytics/page.tsx  → Segment by channel
src/app/api/agents/[id]/deploy/route.ts → Vapi assistant creation
src/app/api/campaigns/[id]/launch/route.ts → vapi.calls.create()
```

### Removed Files
```
src/lib/elevenlabs.ts
src/lib/anthropic.ts
src/app/api/twilio/
src/app/(dashboard)/calls/settings/
```

---

## 11. Migration Strategy (10 weeks)

| Phase | Week | Deliverables |
|-------|------|-------------|
| **1. Foundation** | 1–2 | Install SDKs, create `vapi.ts` + `mcp-gateway.ts`, DB migration, color scheme, rename to Zentara |
| **2. Agent CRUD** | 2–3 | Agent channel split, Vapi deploy, LLM/voice multi-provider, remove ElevenLabs/Anthropic |
| **3. Phone** | 3–4 | Vapi phone numbers, campaign launch via Vapi, voicemail detection |
| **4. Website Voice** | 4–5 | VoiceWidget, WidgetConfigurator, embed script, public agent page |
| **5. MCP Hub** | 5–6 | Connector catalog, OAuth flows, MCP gateway, Google Calendar + HubSpot connectors |
| **6. Squads** | 6–7 | Squad builder UI, Vapi squad API, handoff config |
| **7. Workflows** | 7–8 | Workflow builder UI, engine, triggers, actions, templates |
| **8. Analytics** | 8–9 | Segmented dashboard, call analysis viewer, workflow run stats |
| **9. Polish** | 9–10 | Landing page rebrand, embed docs, security audit, testing |
| **10. Launch** | 10 | Beta users, monitoring, documentation |

---

## 12. Security

| Concern | Mitigation |
|---------|-----------|
| Vapi API key | Server-only, never in client bundle |
| Vapi public key | Safe for browser (read-only) |
| Webhook authenticity | Verify X-Vapi-Signature on every request |
| OAuth tokens | Encrypted at rest in user_integrations, short-lived + refresh |
| MCP tool abuse | Per-user rate limiting, tool allowlisting per agent |
| RLS | All Supabase tables have row-level security |
| Widget abuse | Domain allowlist per agent, rate limiting |
| PII | Configurable PII stripping in analysis plan |
| Workflow actions | Confirm destructive actions (email, SMS) require verified sender |
| HIPAA | Enterprise: Vapi BAA ($1k/mo) + Supabase dedicated |

---

## 13. Performance

| Metric | Target | How |
|--------|--------|-----|
| Voice response | < 600ms | Vapi orchestration |
| Webhook processing | < 200ms | Async DB writes, non-blocking workflow dispatch |
| MCP tool execution | < 2s | Edge-hosted MCP servers, connection pooling |
| Workflow execution | < 5s (simple) | Sequential node processing, async actions |
| Dashboard load | < 1.5s | ISR + edge caching |
| Widget script | < 500ms | CDN, lazy Vapi SDK load |
| Campaign rate | 1 call/2s | Sequential with Vapi rate limits |

---

## 14. Cost Model

### Budget Stack ($0.09/min)
| Component | Cost |
|-----------|------|
| Vapi hosting | $0.05 |
| STT (Deepgram) | $0.01 |
| LLM (GPT-4o Mini) | $0.01 |
| TTS (Deepgram) | $0.02 |

### Premium Stack ($0.19/min)
| Component | Cost |
|-----------|------|
| Vapi hosting | $0.05 |
| STT (Deepgram) | $0.01 |
| LLM (Claude Sonnet 4) | $0.09 |
| TTS (ElevenLabs) | $0.04 |

### Zentara Margin
User-facing price: 1.5–2x pass-through. Free tier subsidized by Pro/Enterprise revenue.
