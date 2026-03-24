# Product Requirements Document (PRD)
# VonexAI Voice Agent Platform — MiniMax Integration

**Version:** 1.0
**Date:** March 23, 2026
**Author:** VonexAI Engineering
**Status:** Draft

---

## 1. Executive Summary

VonexAI is an AI-powered voice agent platform that enables businesses to create, deploy, and manage intelligent voice agents for phone calls and web interactions. The current platform uses ElevenLabs Conversational AI as the core voice infrastructure. This PRD defines the requirements for migrating to a **MiniMax-based architecture** to achieve:

- **5x cost reduction** on TTS (Text-to-Speech) — from ~$300/1M chars to ~$60/1M chars
- **Lower latency** — MiniMax Turbo delivers <250ms vs ElevenLabs ~300ms
- **Better voice quality** — MiniMax Speech-02 ranked #1 on Artificial Analysis and HuggingFace TTS Arena
- **Full platform control** — No vendor lock-in for conversation orchestration
- **Multi-provider telephony** — User choice of Twilio, Plivo, Exotel, Telnyx, or Vonage

---

## 2. Product Vision

Build a self-hosted, real-time conversational AI voice agent platform powered by MiniMax for voice synthesis and recognition, with pluggable telephony providers for phone call connectivity. The system should provide the same user experience as the current ElevenLabs-based platform while being significantly cheaper to operate.

---

## 3. User Personas

### 3.1 Business Owner (Primary)
- Wants to set up AI voice agents for sales, support, or lead qualification
- Non-technical; needs a simple UI to configure agents
- Cares about voice quality, call reliability, and cost

### 3.2 Sales/Marketing Manager
- Runs outbound calling campaigns to lists of contacts
- Needs analytics on call outcomes, lead scoring, sentiment
- Wants automated WhatsApp follow-ups after calls

### 3.3 Platform Admin
- Manages telephony provider credentials and phone numbers
- Monitors system health, call volumes, and costs
- Configures voice cloning and custom voices

---

## 4. Feature Requirements

### 4.1 Voice Agent Management

#### 4.1.1 Agent Creation (P0)
- Multi-step wizard: Channel > Domain > Persona > Voice > Knowledge > Settings > Review
- **Channels:** Website (WebSocket chat), Calling (phone calls)
- **Domains:** Real Estate, Healthcare, E-Commerce, Automobile, Banking, Legal, etc.
- **Agent Types:** Per-domain specialization (e.g., Property Agent, Sales Agent)

#### 4.1.2 Agent Persona Configuration (P0)
- Agent Name, Description
- Personality Traits: Professional, Friendly, Empathetic, Authoritative, Casual
- Response Style: Concise, Detailed, Conversational, Formal
- First Message (customizable, supports `{{contact_name}}` template variable)
- System Prompt (defines agent behavior, rules, knowledge context)

#### 4.1.3 Voice Selection & Configuration (P0)
- Browse 300+ MiniMax built-in voices with preview/playback
- Filter by gender, language, accent
- Voice settings: Speed (0.5x-2x), Pitch, Volume, Emotion (happy, sad, angry, fearful, disgusted, surprised, neutral)
- Language selection (40+ languages)

#### 4.1.4 Voice Cloning (P0)
- Upload audio sample (minimum 10 seconds)
- Clone voice via MiniMax Voice Clone API
- Preview cloned voice before deployment
- Store cloned voice IDs persistently (handle MiniMax 7-day expiry by periodic refresh)
- Support multiple cloned voices per user

#### 4.1.5 Knowledge Base (P0)
- File upload: PDF (with OCR for scanned docs), DOCX, TXT, CSV, JSON, Images (JPG, PNG)
- URL scraping: Lightweight fetch + Puppeteer fallback for JS-rendered pages
- FAQ entries: Manual question-answer pairs
- Content extraction, chunking, and injection into system prompt

#### 4.1.6 Agent Deployment (P0)
- Deploy agent with all configurations
- Status management: Draft, Active, Paused, Archived
- Re-deployment on configuration changes

### 4.2 Real-Time Voice Conversation Engine

#### 4.2.1 Conversation Pipeline (P0)
The core real-time voice pipeline must handle:
1. **Audio Input** — Capture user speech from phone/WebSocket
2. **VAD (Voice Activity Detection)** — Detect when user starts/stops speaking
3. **STT (Speech-to-Text)** — Transcribe user speech via MiniMax STT
4. **LLM Processing** — Send transcript to LLM (Claude/GPT) with system prompt + knowledge
5. **TTS (Text-to-Speech)** — Convert LLM response to speech via MiniMax TTS
6. **Audio Output** — Stream synthesized speech back to user
7. **Interruption Handling** — Allow user to interrupt agent mid-speech

#### 4.2.2 Latency Requirements (P0)
- End-to-end response time: <1.5 seconds (voice-in to voice-out)
- TTS streaming: First audio chunk within 250ms
- STT recognition: Real-time streaming transcription

#### 4.2.3 Turn-Taking (P0)
- Silence detection: End-of-turn after configurable timeout (default 1.5s)
- Soft timeout: "Are you still there?" prompt after extended silence
- Hard timeout: End call after 30s of silence
- Barge-in: User can interrupt agent response

#### 4.2.4 Conversation Tracking (P0)
- Store full transcript with timestamps and speaker roles
- Track conversation duration, turn count
- Store conversation metadata (agent ID, phone numbers, direction)

### 4.3 Phone Calling

#### 4.3.1 Multi-Provider Telephony (P0)
- Support: Twilio, Plivo, Exotel, Telnyx, Vonage
- User configures provider credentials in Settings
- Import phone numbers from any provider
- Assign phone numbers to agents

#### 4.3.2 Outbound Calling (P0)
- Make outbound calls via API
- Contact name passed to agent for personalized greeting
- Agent greets by name: "Hi {{contact_name}}, this is..."
- Agent NEVER asks for phone number (injected rule)
- Call recording and transcript storage

#### 4.3.3 Inbound Calling (P0)
- Receive inbound calls on assigned phone numbers
- Route to correct agent based on number assignment
- Same conversation pipeline as outbound

#### 4.3.4 Campaign Management (P0)
- Create campaigns with contact lists (CSV upload or manual entry)
- Sequential outbound calling with configurable settings
- Max retries, retry delay, calling hours
- Campaign progress tracking and analytics

### 4.4 WhatsApp Integration

#### 4.4.1 Automated Follow-up (P0)
- After call completion, AI analyzes transcript
- If agent promised to send info via WhatsApp, auto-compose and send message
- Use Twilio Content Templates for messages outside 24-hour window
- Fallback to freeform text within 24-hour conversation window

#### 4.4.2 Message Tracking (P0)
- Log all sent WhatsApp messages with status (sent, delivered, read, failed)
- Display WhatsApp follow-up section on call detail page
- Link messages to originating call

### 4.5 Dashboard & Analytics

#### 4.5.1 Overview Dashboard (P0)
- Total agents, active agents, website vs calling split
- Total conversations, total calls
- API usage tracking

#### 4.5.2 Calling Analytics (P0)
- Call volume (inbound vs outbound, 30-day trend)
- Call status distribution (completed, failed, no answer, ringing)
- Duration distribution (buckets: 0-30s, 30s-1m, 1-2m, 2-5m, 5m+)
- Peak hours analysis
- Agent leaderboard
- Campaign progress

#### 4.5.3 AI-Powered Analytics (P0)
- **Auto-analyze** all completed calls using Claude AI
- Sentiment analysis: Positive, Negative, Neutral, Mixed (with score -1 to +1)
- Lead temperature: Hot, Warm, Cold (with score 0-100)
- Customer intent classification
- Key topics extraction
- Engagement level: High, Medium, Low
- Hot leads and cold leads lists
- Top discussion topics
- Action items and objections from calls

### 4.6 Website Chat Agent

#### 4.6.1 Web Widget (P1)
- Embeddable chat widget for websites
- Real-time voice conversation via WebSocket
- Text chat fallback
- Customizable appearance

### 4.7 User Management

#### 4.7.1 Authentication (P0)
- Email/password signup and signin
- Profile management
- Plan tier management (Free, Pro, Enterprise)

---

## 5. Non-Functional Requirements

### 5.1 Performance
- TTS first-byte latency: <250ms
- STT transcription: Real-time streaming
- API response times: <500ms for CRUD operations
- Concurrent calls: Support 50+ simultaneous calls per deployment

### 5.2 Scalability
- Horizontal scaling via container orchestration
- Stateless application servers
- Database connection pooling

### 5.3 Reliability
- 99.9% uptime for calling infrastructure
- Graceful degradation if MiniMax API is unavailable
- Call recording backup storage

### 5.4 Security
- Encrypted credential storage for telephony providers
- Row-level security on all user data
- HTTPS everywhere
- No sensitive data in logs

### 5.5 Cost Targets
- TTS cost: <$0.01 per minute of generated speech
- Total platform cost per call: <$0.05/minute (excluding telephony)
- 5x cheaper than current ElevenLabs-based system

---

## 6. Success Metrics

| Metric | Target |
|--------|--------|
| TTS cost reduction | >60% vs ElevenLabs |
| Voice quality rating | Equal or better than current |
| End-to-end latency | <1.5s |
| Call success rate | >90% |
| WhatsApp delivery rate | >95% |
| Platform uptime | 99.9% |

---

## 7. Out of Scope (v1)

- Video calling
- Multi-party conference calls
- SMS messaging (non-WhatsApp)
- CRM integrations (Salesforce, HubSpot)
- Custom LLM fine-tuning
- On-premise deployment

---

## 8. Timeline Estimate

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| Phase 1: Core Pipeline | 4-6 weeks | MiniMax TTS/STT integration, real-time conversation engine, basic agent management |
| Phase 2: Telephony | 2-3 weeks | Multi-provider phone integration, inbound/outbound calling, SIP trunking |
| Phase 3: Platform Features | 3-4 weeks | Voice cloning, knowledge base, campaigns, WhatsApp, analytics |
| Phase 4: Migration & Testing | 2-3 weeks | Data migration, A/B testing, performance tuning, production deployment |
| **Total** | **11-16 weeks** | Full platform migration |

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| MiniMax API instability | Call failures | Implement fallback to ElevenLabs TTS |
| Voice cloning 7-day expiry | Lost cloned voices | Background job to refresh voices every 5 days |
| Higher engineering complexity | Delayed launch | Phase the migration, keep ElevenLabs as fallback |
| Telephony SIP integration complexity | Call quality issues | Use proven frameworks (Pipecat/LiveKit) |
| MiniMax rate limits | Throttled calls | Implement request queuing and backpressure |

---

## 10. Appendix

### 10.1 Current Architecture (ElevenLabs)
```
User → App UI → ElevenLabs Conversational AI API → Twilio (Phone)
                                                  → WebSocket (Web)
```

### 10.2 Target Architecture (MiniMax)
```
User → App UI → Conversation Orchestrator (Pipecat/Custom)
                    ├── MiniMax STT (Speech-to-Text)
                    ├── LLM (Claude/GPT via API)
                    ├── MiniMax TTS (Text-to-Speech)
                    ├── Twilio/Plivo SIP (Phone Calls)
                    └── WebSocket (Web Chat)
```
