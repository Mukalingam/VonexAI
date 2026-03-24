# Zentara — Product Requirements Document (PRD)

**Version:** 1.0
**Date:** March 2, 2026
**Tagline:** "Build AI agents that talk, call, connect, and automate."
**Stack:** Next.js 16 · Supabase · Vapi API · Tailwind CSS / shadcn/ui

---

## 1. Executive Summary

Zentara is a full-stack AI agent platform that lets businesses build, deploy, and manage voice AI agents, phone calling agents, workflow automations, and third-party integrations — all from a single no-code interface.

**What makes Zentara unique:**
- **Two agent channels** in one product: website voice widgets + phone calling agents
- **MCP (Model Context Protocol) hub** — users connect agents to any external tool (CRM, calendar, database, Slack, etc.) via a visual MCP connector marketplace
- **Workflow automation builder** — drag-and-drop event → action chains triggered by agent conversations
- **Multi-agent Squads** — chain specialized agents in a single call with context-preserving handoffs
- **White-labeled** — powered by Vapi under the hood, but no Vapi branding is ever exposed

**Backend:** Vapi provides a single unified API for STT, LLM, TTS, phone calling, web embedding, knowledge base, call analysis, voicemail detection, and multi-agent orchestration.

---

## 2. Brand Identity

### 2.1 Name
**Zentara** — From "Zen" (simplicity, clarity) + "Tara" (star, guiding light). Signals a platform that makes complex AI simple and accessible.

### 2.2 Color Scheme — Amber + Charcoal

No competitor uses amber/gold. Vapi = dark + cyan, Bland = black + red, Retell = navy blue, Synthflow = purple, Voiceflow = orange. Zentara's warm amber stands completely alone.

```
Primary:       #F59E0B  (Amber 500 — warm gold)
Primary Hover: #D97706  (Amber 600 — deep gold)
Primary Light: #FEF3C7  (Amber 100 — soft glow)
Accent:        #B45309  (Amber 700 — rich bronze)

Sidebar BG:    #1C1917  (Stone 900 — warm charcoal)
Sidebar Text:  #FAFAF9  (Stone 50 — warm white)
Sidebar Active:#F59E0B/15%  (Amber glow on dark)
Sidebar Border:#292524  (Stone 800)

Background:    #FAFAF9  (Stone 50 — warm white)
Foreground:    #1C1917  (Stone 900 — deep charcoal)
Card:          #FFFFFF
Border:        #E7E5E4  (Stone 200)
Muted:         #F5F5F4  (Stone 100)
Muted Text:    #78716C  (Stone 500)

Success:       #10B981  (Emerald)
Warning:       #F59E0B  (Amber — matches primary)
Destructive:   #EF4444  (Red 500)
Ring/Focus:    #F59E0B  (Amber)
```

### 2.3 Typography
- **Headings:** Inter (or Satoshi for premium feel)
- **Body:** Inter
- **Code/Mono:** JetBrains Mono

### 2.4 Competitor Color Map

| Platform | Primary Color | Accent |
|----------|--------------|--------|
| Vapi | Dark + Cyan #00D8FF | Purple |
| Bland.ai | Black | Red |
| Retell | Navy Blue #00122E | Apricot |
| Synthflow | Purple Gradient #5B0DD5→#B881FF | Purple |
| Voiceflow | Orange #F55C15 | Blue |
| **Zentara** | **Amber #F59E0B** | **Bronze #B45309** |

Zentara is the only warm-gold AI platform in the market.

---

## 3. Target Users

| Persona | Description | Key Feature |
|---------|-------------|-------------|
| **Small Business Owner** | Wants a receptionist agent without hiring staff | Website widget + inbound calls |
| **Sales Manager** | Needs outbound calling campaigns with lead qualification | Campaigns + call analysis |
| **Healthcare Admin** | Requires HIPAA-compliant appointment scheduling | Squads + workflow automation |
| **E-commerce Operator** | Wants order status, returns, product agents | MCP (Shopify, Stripe) + KB |
| **Agency/Developer** | Builds agents for multiple clients across domains | White-label + MCP marketplace |
| **Operations Lead** | Automates post-call workflows (CRM, email, tickets) | Workflow builder + MCP |

---

## 4. Core Differentiators

| Feature | Zentara | Vapi (raw) | Bland.ai | Retell | Voiceflow |
|---------|---------|------------|----------|--------|-----------|
| No-code agent builder | Wizard | Dashboard | Yes | Yes | Yes |
| Website + Phone | Split wizard | Manual | Phone only | Both | Chat only |
| **MCP Integration Hub** | **Visual marketplace** | **No** | **No** | **No** | **No** |
| **Workflow Automations** | **Drag-and-drop** | **No** | **No** | **No** | **Flows** |
| Campaign management | Built-in | No | Yes | No | No |
| Multi-agent squads | Visual builder | API only | No | No | No |
| Call analysis | Custom schemas | Basic | Basic | Basic | No |
| Knowledge base | Upload+FAQ+URL | Upload | Upload | Upload | KB |
| Domain templates | 16+ | No | No | No | Templates |
| Personality system | Traits + style | Prompt | Prompt | Prompt | Prompt |

---

## 5. Agent Types & Creation Flow

### 5.1 Agent Type Selection (Step 0)

```
┌──────────────────────────────────┬──────────────────────────────────┐
│    🌐 Website Voice Agent        │    📞 Calling Agent              │
│                                  │                                  │
│  Embeddable voice widget for     │  Inbound & outbound phone calls  │
│  your website. Visitors talk     │  with real phone numbers.        │
│  to your AI in the browser.     │  Campaigns, support lines, and   │
│                                  │  appointment calls.              │
│  • Web SDK integration           │  • Vapi / Twilio phone numbers   │
│  • Custom widget styling         │  • Voicemail detection           │
│  • Client-side MCP tools         │  • Call transfer & forwarding    │
│  • Real-time transcripts         │  • Campaign management           │
└──────────────────────────────────┴──────────────────────────────────┘
```

### 5.2 Shared Wizard (Steps 1–5)

| Step | Name | Fields |
|------|------|--------|
| 1 | **Domain** | Industry domain (16 options), agent type template |
| 2 | **Persona** | Personality traits, response style, first message, system prompt |
| 3 | **Voice & Language** | Voice provider + voice, language, voice settings |
| 4 | **Knowledge Base** | File uploads, FAQ entries, URL scraping |
| 5 | **Advanced** | LLM model, temperature, max duration, webhook, topics, HIPAA |

### 5.3 Channel-Specific Step 6

**Website Agent — Widget Config:**
- Widget position, brand colors, button icon, welcome text, auto-open delay
- Embed code snippet + React component code
- Live preview iframe

**Calling Agent — Phone Config:**
- Select/import phone number
- Inbound: auto-answer, business hours, greeting
- Outbound: caller ID, voicemail detection, voicemail message template
- Call transfer destinations

### 5.4 Step 7 — Integrations (MCP + Workflows)
- Browse MCP connector marketplace
- Connect tools: Google Calendar, Shopify, HubSpot, Slack, etc.
- Set up post-call workflow triggers
- Optional — can skip and add later from agent detail page

---

## 6. MCP Integration Hub

### 6.1 What Is MCP
Model Context Protocol is an open standard (by Anthropic, donated to Linux Foundation) that enables AI agents to connect to external tools, databases, and APIs through a standardized interface. Instead of custom code for each integration, MCP provides a universal "plug" that any tool can implement.

### 6.2 Zentara's MCP Marketplace

A visual hub where users browse, install, and configure pre-built MCP connectors:

**Pre-built Connectors (Launch Set):**

| Category | Connectors |
|----------|------------|
| **CRM** | HubSpot, Salesforce, Pipedrive, Zoho CRM |
| **Calendar** | Google Calendar, Outlook Calendar, Calendly |
| **E-commerce** | Shopify, WooCommerce, Stripe |
| **Communication** | Slack, Email (SendGrid/Gmail), WhatsApp, SMS (Twilio) |
| **Support** | Zendesk, Freshdesk, Intercom, Linear |
| **Database** | Supabase, PostgreSQL, Airtable, Google Sheets |
| **Custom** | Webhook (any REST API), Custom MCP Server URL |

### 6.3 How It Works

```
User browses MCP Marketplace
  │
  ├── Selects "Google Calendar" connector
  ├── Authorizes via OAuth2 flow
  ├── Configures: which calendars, time slots, booking rules
  │
  ▼
Connector becomes a "Tool" on the Vapi assistant
  │
  ├── Agent can now: "Check availability", "Book appointment", "Cancel meeting"
  ├── Vapi calls Zentara's webhook → Zentara executes MCP tool → returns result
  └── User sees tool calls in real-time transcript
```

### 6.4 Custom MCP Servers
For developers:
- Enter MCP server URL (any endpoint implementing the MCP spec)
- Zentara discovers available tools, resources, and prompts
- User selects which tools to expose to the agent
- Full TypeScript SDK for building custom MCP servers

### 6.5 MCP Configuration Per Agent
Each agent has an "Integrations" tab:
- List of connected MCP tools
- Per-tool configuration (scopes, permissions, data access)
- Test tool execution with sample inputs
- Enable/disable tools without disconnecting

---

## 7. Workflow Automation Builder

### 7.1 Concept
Users create event → action chains that fire automatically based on agent activity. Think "Zapier for your voice agents" — but built into the platform.

### 7.2 Workflow Triggers (Events)

| Trigger | Description |
|---------|-------------|
| **Call Ended** | When any call completes (with filters: success/fail/voicemail) |
| **Call Analysis Ready** | When post-call analysis is generated |
| **Keyword Detected** | When specific words/phrases appear in transcript |
| **Sentiment Threshold** | When sentiment drops below / exceeds threshold |
| **Agent Handoff** | When call transfers between squad members |
| **Campaign Completed** | When all contacts in a campaign are processed |
| **Widget Interaction** | When web visitor starts/ends voice session |
| **Schedule** | Cron-based triggers (daily reports, weekly summaries) |

### 7.3 Workflow Actions

| Action | Description |
|--------|-------------|
| **Send Email** | Via SendGrid/SMTP with template variables |
| **Send Slack Message** | To channel or DM with call summary |
| **Create CRM Record** | Push extracted data to HubSpot/Salesforce |
| **Update Google Sheet** | Append row with call data |
| **Create Support Ticket** | In Zendesk/Freshdesk/Linear |
| **Send SMS** | Via Twilio with template |
| **Call Webhook** | HTTP POST to any URL with payload |
| **Add to Campaign** | Auto-add contact to another campaign |
| **Update Agent** | Change system prompt, enable/disable tools |
| **Generate Report** | Create PDF summary and email it |

### 7.4 Workflow Builder UI

Visual drag-and-drop canvas:
```
┌─────────┐     ┌──────────────┐     ┌────────────┐
│ Trigger  │────▶│  Condition   │────▶│   Action   │
│ Call End │     │ Success=true │     │ Send Email │
└─────────┘     └──────────────┘     └────────────┘
                       │
                       │ else
                       ▼
                ┌────────────┐
                │   Action   │
                │Create Ticket│
                └────────────┘
```

Components:
- **Trigger node** — the event that starts the workflow
- **Condition node** — if/else branching based on call data, analysis, or extracted fields
- **Action node** — execute an integration (uses MCP connectors)
- **Delay node** — wait N minutes/hours before next step
- **Loop node** — iterate over array (e.g., all contacts in a campaign)

### 7.5 Template Workflows
Pre-built templates users can install with one click:

| Template | Trigger → Action |
|----------|------------------|
| **Post-Call CRM Update** | Call ended → Extract lead info → Create HubSpot contact |
| **Escalation Alert** | Sentiment < 0.3 → Send Slack alert to manager |
| **Appointment Confirmation** | Call ended (success) → Send confirmation email + calendar invite |
| **Failed Call Retry** | Call failed → Wait 30 min → Add to retry campaign |
| **Daily Summary Report** | Schedule (6pm) → Aggregate day's calls → Email PDF report |
| **Voicemail Follow-Up** | Voicemail detected → Send SMS "We tried to reach you" |

---

## 8. LLM Model Selection

Grouped by provider with cost/latency indicators:

| Provider | Models | Cost Tier |
|----------|--------|-----------|
| **OpenAI** | GPT-4o, GPT-4o Mini, GPT-4.1, GPT-4.1 Mini, GPT-4.1 Nano, GPT-4.5 Preview | $–$$$ |
| **Anthropic** | Claude 3 Opus, Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3.7 Sonnet, Claude Sonnet 4, Claude Sonnet 4.5 | $–$$$ |
| **Google** | Gemini 2.0 Flash, Gemini 2.5 Flash, Gemini 2.5 Pro | $–$$ |
| **xAI** | Grok 2, Grok 3 | $$ |
| **Mistral** | Mistral Large, Pixtral Large | $ |
| **DeepSeek** | DeepSeek R1, DeepSeek V3 | $ |
| **Open Source** | Llama 3.3 70B (Groq/Together) | $ |

Default: **GPT-4o Mini** (fastest). Recommended: **Claude Sonnet 4**.

---

## 9. Voice Selection

### 9.1 Providers
- **ElevenLabs** — Premium, most natural ($0.036/min)
- **Deepgram** — Fast, cost-effective ($0.0108/min)
- **PlayHT** — Expressive ($0.0648/min)
- **Azure** — Enterprise ($0.0108/min)
- **OpenAI** — GPT voices ($0.0108/min)
- **Cartesia** — Ultra-low latency
- **Rime AI** — Specialized
- **Smallest AI**, **Neuphonic**, **Hume** — Additional options

### 9.2 UI
- Filter by provider, gender, language, accent
- Audio preview with sample text
- Voice settings: stability, similarity, speed, style
- Voice cloning (ElevenLabs users)

---

## 10. Multi-Agent Squads

### 10.1 Visual Squad Builder
Drag agents onto a canvas, draw handoff arrows, configure:
- **Entry agent** (who starts the call)
- **Handoff trigger** (text description of when to transfer)
- **Context mode**: None / Last N / All messages
- Per-handoff data extraction (summarize before transfer)

### 10.2 Example Squads
- **Healthcare**: Receptionist → Triage Nurse → Appointment Booker
- **Sales**: Lead Qualifier → Product Specialist → Closing Agent
- **Support**: FAQ Bot → Technical Agent → Human Escalation

---

## 11. Knowledge Base

Unchanged from v1 + Vapi file support:
- `.pdf`, `.docx`, `.doc`, `.txt`, `.csv`, `.md`, `.tsv`, `.yaml`, `.json`, `.xml`, `.log`
- File upload, FAQ builder, URL scraper, text input
- Automatic query tool on Vapi
- Per-agent isolation, processing status tracking

---

## 12. Conversation Intelligence

### 12.1 Assistant Hooks
Event-driven rules (no code):
- Call ending → transfer/webhook/message
- Customer silence → prompt/transfer/end
- Interruption → acknowledge/rephrase
- Low confidence → clarify/repeat

### 12.2 Call Analysis
Auto-generated post-call:
- Summary (2-3 sentences)
- Structured data extraction (custom JSON schema)
- Success evaluation (Pass/Fail, Likert, 1-10, %, checklist)
- Sentiment score

### 12.3 Background Messages
Real-time context injection during live calls via API or MCP triggers.

---

## 13. Campaign Management

Same as current implementation:
- Create → contacts → settings → launch
- CSV upload, variable injection, voicemail detection
- Retry logic, calling hours, pause/resume
- Real-time progress tracking
- Post-campaign workflow triggers (new in v2)

---

## 14. Analytics Dashboard

### 14.1 Segmented Views
- **Overview** — aggregate stats across all agents
- **Website Voice** — widget sessions, completion rate, peak hours
- **Phone Calls** — inbound/outbound, duration, voicemail rate
- **Campaigns** — per-campaign performance, success rate
- **Workflows** — trigger counts, action success/failure rates

### 14.2 Per-Agent Analytics
- Conversations with transcripts + audio playback
- Call analysis (summary, structured data, success)
- MCP tool usage (which tools called, success rate)
- Workflow trigger history
- Cost breakdown (STT + LLM + TTS per call)

---

## 15. Pages & Navigation

### 15.1 Sidebar
```
Dashboard
My Agents
Create Agent
Phone Calls
Campaigns          [New]
Squads             [New]
Workflows          [New]
Integrations       [New]   ← MCP Hub
Analytics
Knowledge Base
Profile
Billing
```

### 15.2 Full Page List

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Overview stats, recent activity, quick actions |
| My Agents | `/agents` | Agent list with type badge (web/phone), status |
| Create Agent | `/agents/new` | 7-step wizard (type→domain→persona→voice→KB→advanced→channel+integrations) |
| Agent Detail | `/agents/[id]` | Config, test, analytics, embed code, integrations |
| Phone Calls | `/calls` | Call logs with filters, playback, analysis |
| Call Detail | `/calls/[id]` | Transcript, analysis, recording, MCP tool log |
| Campaigns | `/campaigns` | Campaign list with progress |
| Campaign Create | `/campaigns/new` | 3-step wizard |
| Campaign Detail | `/campaigns/[id]` | Live progress, contacts |
| Squads | `/squads` | Squad list |
| Squad Builder | `/squads/new` | Visual multi-agent canvas |
| Workflows | `/workflows` | Workflow list with trigger counts |
| Workflow Builder | `/workflows/new` | Drag-and-drop canvas |
| Workflow Detail | `/workflows/[id]` | Run history, logs |
| Integrations | `/integrations` | MCP connector marketplace |
| Integration Detail | `/integrations/[id]` | Config, OAuth, test |
| Analytics | `/analytics` | Segmented dashboard |
| Knowledge Base | `/knowledge` | File management per agent |
| Profile | `/profile` | User settings, API keys |
| Billing | `/billing` | Plan, usage, invoices |
| Public Agent | `/chat/[agentId]` | Shareable voice agent page |
| Landing | `/` | Marketing site |

---

## 16. Billing

### 16.1 Plans

| Feature | Free | Pro ($49/mo) | Enterprise |
|---------|------|-------------|------------|
| Agents | 2 | 20 | Unlimited |
| Minutes/month | 100 | 2,000 | Custom |
| Knowledge files | 5 | 50 | Unlimited |
| Campaigns | 1 | Unlimited | Unlimited |
| Squads | — | 5 | Unlimited |
| Workflows | 3 | 30 | Unlimited |
| MCP Connectors | 2 | 15 | Unlimited |
| Call recording | — | Yes | Yes |
| Custom analysis schemas | — | 3 | Unlimited |
| Custom MCP servers | — | Yes | Yes |
| HIPAA | — | — | Yes |

### 16.2 Overage
Beyond included minutes: billed at pass-through rates + Zentara margin.

---

## 17. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Voice response latency | < 600ms |
| Page load time | < 2s |
| Uptime SLA | 99.9% |
| Webhook processing | < 200ms |
| Widget script load | < 500ms |
| Security | RLS, JWT, HTTPS, webhook signatures |
| Accessibility | WCAG 2.1 AA |
| Browser support | Chrome, Firefox, Safari, Edge (latest 2) |
| Mobile | Responsive dashboard + widget |

---

## 18. Success Metrics

| KPI | Target (6 months) |
|-----|-------------------|
| Registered users | 5,000 |
| Active agents | 2,000 |
| Monthly minutes | 500,000 |
| MCP connectors installed | 10,000 |
| Workflows created | 3,000 |
| Avg. agent setup time | < 10 min |
| Campaign completion | > 85% |
| 30-day retention | > 40% |
| NPS | > 50 |
