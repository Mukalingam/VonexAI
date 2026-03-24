# Vonex AI — Intelligent Voice Automation Platform

An AI-powered voice agent platform that enables businesses to create, deploy, and manage intelligent voice agents for phone calls and web interactions. Built with Next.js, Supabase, ElevenLabs, and Claude AI.

**Built by Muka Lingam**

---

## Features

### AI Voice Agents
- Create custom AI calling and web chat agents with a 7-step wizard
- 15+ industry domains: Real Estate, Healthcare, E-Commerce, Automobile, Banking, Legal, etc.
- Configurable personality traits, response styles, and system prompts
- Knowledge base with file upload (PDF, DOCX, TXT, Images with OCR), URL scraping, and FAQ

### Phone Calling
- Multi-provider telephony: **Twilio, Plivo, Exotel, Telnyx, Vonage**
- Inbound and outbound AI-powered phone calls
- Contact name greeting — agent addresses callers by name
- Outbound rules — agent never asks for phone/WhatsApp number on outbound calls
- Call recording with audio playback
- Full conversation transcripts with timestamps

### Campaigns
- Bulk outbound calling campaigns with contact lists
- Sequential call execution with retry logic
- Campaign progress tracking and analytics
- Configurable calling hours and max retries

### WhatsApp Integration
- Automated WhatsApp follow-up after calls via Twilio
- AI analyzes call transcript to detect WhatsApp promises
- Auto-composes and sends relevant follow-up message
- Twilio Content Template API support for messages outside 24-hour window
- Message tracking with delivery status

### AI-Powered Analytics Dashboard
- Auto-analyze all completed calls using Claude AI
- Sentiment analysis: Positive, Negative, Neutral, Mixed
- Lead temperature scoring: Hot, Warm, Cold (0-100 score)
- Customer engagement level tracking
- Top discussion topics extraction
- Call volume trends, duration distribution, peak hours
- Agent leaderboard and campaign progress

### Voice Configuration
- 4,000+ ElevenLabs voices with preview
- Voice cloning support
- Voice settings: Stability, Similarity Boost, Style, Speed
- Multi-language support (15+ languages)
- Gender filtering and voice search

### Knowledge Base & RAG
- PDF extraction with OCR fallback (Tesseract.js) for scanned documents
- Direct image upload with OCR text extraction
- URL scraping with Puppeteer for JS-rendered pages
- @mozilla/readability for clean article extraction
- Content injected into agent system prompt

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TailwindCSS, shadcn/ui |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Voice AI | ElevenLabs Conversational AI |
| LLM | Claude (Anthropic) via ElevenLabs |
| Telephony | Twilio, Plivo, Exotel, Telnyx, Vonage |
| WhatsApp | Twilio WhatsApp API |
| OCR | Tesseract.js + Sharp |
| Web Scraping | Puppeteer + @mozilla/readability |
| Deployment | Docker, AWS ECR, AWS EC2 |

---

## Prerequisites

- **Node.js** 20+
- **npm** 9+
- **Docker** (for production deployment)
- **Supabase** account
- **ElevenLabs** API key
- **Anthropic (Claude)** API key
- **Twilio** account (for phone calling + WhatsApp)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Mukalingam/VonexAI.git
cd VonexAI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Anthropic (Claude) API
ANTHROPIC_API_KEY=your_anthropic_api_key

# ElevenLabs API
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 4. Supabase Database Setup

Run the SQL migrations in order on your Supabase SQL Editor (`https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new`):

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_public_access.sql
supabase/migrations/003_phone_calling.sql
supabase/migrations/004_security_hardening.sql
supabase/migrations/005_campaigns.sql
supabase/migrations/006_agent_channel.sql
supabase/migrations/007_multi_provider_telephony.sql
```

Run each file sequentially. Each migration builds on the previous one.

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Your First Agent

1. Sign up / Sign in
2. Click **Create Agent**
3. Select Channel: **Calling** or **Website**
4. Choose a Domain (e.g., Real Estate)
5. Configure Persona: Name, Description, Personality, System Prompt, First Message
6. Select Voice from ElevenLabs library
7. Upload Knowledge Base documents (optional)
8. Configure Settings (LLM model, temperature)
9. Review and Deploy

### 7. Set Up Phone Calling

1. Go to **Phone Calls** > **Settings**
2. Select a provider (Twilio, Plivo, Exotel, Telnyx, or Vonage)
3. Enter your provider credentials
4. Import a phone number
5. Assign the phone number to your agent
6. Make a test call from **Phone Calls** > **Make a Call**

### 8. Set Up WhatsApp (Twilio)

1. Go to Twilio Console > Messaging > Try it out > **Send a WhatsApp message**
2. Connect to the WhatsApp Sandbox (send the join code from your phone)
3. WhatsApp follow-ups will auto-trigger after calls where the agent promises to send info

---

## Production Deployment (Docker + AWS)

### 1. Build Docker Image

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key \
  --build-arg NEXT_PUBLIC_APP_URL=https://your-domain.com \
  -t your-ecr-repo:latest .
```

### 2. Push to AWS ECR

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker tag your-ecr-repo:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/your-repo:latest

docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/your-repo:latest
```

### 3. Deploy on EC2

```bash
# SSH into your EC2 instance

# Login to ECR
sudo aws ecr get-login-password --region us-east-1 | sudo docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Pull latest image
sudo docker pull YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/your-repo:latest

# Stop old container
sudo docker stop vonexai && sudo docker rm vonexai

# Run new container
sudo docker run -d --name vonexai -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key \
  -e SUPABASE_SERVICE_ROLE_KEY=your_service_role_key \
  -e ANTHROPIC_API_KEY=your_anthropic_key \
  -e ELEVENLABS_API_KEY=your_elevenlabs_key \
  -e NEXTAUTH_SECRET=your_secret \
  -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
  YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/your-repo:latest
```

### 4. Verify Deployment

```bash
sudo docker ps          # Check container is running
sudo docker logs vonexai # Check for errors
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Auth pages (signin, signup, forgot-password)
│   ├── (dashboard)/         # Dashboard pages
│   │   ├── dashboard/       # Main dashboard with analytics
│   │   ├── agents/          # Agent management (list, create, edit)
│   │   ├── calls/           # Phone calls (list, detail, settings)
│   │   ├── campaigns/       # Campaign management
│   │   └── ...
│   ├── api/                 # API routes
│   │   ├── agents/          # Agent CRUD + deploy
│   │   ├── calls/           # Call initiation, listing, analytics, analyze
│   │   ├── phone-numbers/   # Phone number import and management
│   │   ├── telephony/       # Multi-provider config
│   │   ├── twilio/          # Legacy Twilio config
│   │   ├── whatsapp/        # WhatsApp messaging + auto-send
│   │   ├── campaigns/       # Campaign CRUD + launch
│   │   ├── voices/          # Voice listing and preview
│   │   └── ...
│   └── platform/            # Public platform pages (web chat widget)
├── components/
│   ├── agents/              # Agent builder step components
│   ├── calls/               # Call-related UI (config, phone manager, dialog)
│   ├── dashboard/           # Dashboard tab components with charts
│   ├── landing/             # Landing page components
│   └── ui/                  # shadcn/ui base components
├── lib/
│   ├── elevenlabs.ts        # ElevenLabs API wrapper
│   ├── knowledge.ts         # Knowledge base extraction (PDF, OCR, URL scraping)
│   ├── validations.ts       # Zod validation schemas
│   ├── domains.ts           # Domain configurations and templates
│   ├── supabase/            # Supabase client helpers
│   └── utils.ts             # Utility functions
└── types/
    └── index.ts             # TypeScript type definitions

supabase/
└── migrations/              # Database migration SQL files (001-007)

docs/
├── PRD_MiniMax_Voice_Agent_Platform.md   # Product Requirements (MiniMax migration)
└── TRD_MiniMax_Voice_Agent_Platform.md   # Technical Requirements (MiniMax migration)
```

---

## Database Schema

### Core Tables
- `users` — User profiles with plan tiers and API usage
- `agents` — AI agent configurations (persona, voice, LLM settings)
- `knowledge_bases` — Uploaded documents, URLs, FAQs per agent
- `conversations` — Website chat conversations
- `messages` — Individual chat messages

### Phone Calling Tables
- `twilio_configs` — Twilio credential storage (legacy)
- `telephony_configs` — Multi-provider credential storage
- `phone_numbers` — Imported phone numbers with agent assignments
- `call_logs` — All inbound/outbound call records with transcripts

### Campaign Tables
- `campaigns` — Bulk calling campaigns with settings
- `campaign_calls` — Per-contact call records within campaigns

### WhatsApp Tables
- `whatsapp_messages` — Sent WhatsApp messages linked to calls

---

## API Reference

### Agents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents` | List agents |
| POST | `/api/agents` | Create agent |
| PATCH | `/api/agents/:id` | Update agent |
| DELETE | `/api/agents/:id` | Delete agent |
| POST | `/api/agents/:id/deploy` | Deploy to ElevenLabs |

### Calls
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calls` | List calls (auto-syncs with ElevenLabs) |
| POST | `/api/calls` | Initiate outbound call |
| GET | `/api/calls/:id` | Call detail with transcript |
| GET | `/api/calls/:id/recording` | Stream call recording |
| POST | `/api/calls/analyze` | AI-analyze call transcripts |
| GET | `/api/calls/analyze` | Get analysis results |

### Telephony
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/telephony/config` | List provider configs |
| POST | `/api/telephony/config` | Add provider credentials |
| DELETE | `/api/telephony/config/:id` | Remove config |
| GET | `/api/phone-numbers` | List phone numbers |
| POST | `/api/phone-numbers` | Import phone number |

### WhatsApp
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/whatsapp` | Send WhatsApp message |
| GET | `/api/whatsapp` | List sent messages |
| POST | `/api/whatsapp/auto-send` | AI-analyze and auto-send |

---

## License

Proprietary — Muka Lingam. All rights reserved.
