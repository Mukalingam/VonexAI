# Technical Requirements Document (TRD)
# VonexAI Voice Agent Platform — MiniMax Architecture

**Version:** 1.0
**Date:** March 23, 2026
**Author:** VonexAI Engineering
**Status:** Draft

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
                                    +------------------+
                                    |   Next.js App    |
                                    |   (Frontend +    |
                                    |    API Routes)   |
                                    +--------+---------+
                                             |
                    +------------------------+------------------------+
                    |                        |                        |
            +-------v--------+     +---------v---------+    +--------v--------+
            |  Conversation  |     |    Supabase DB     |    |   MiniMax API   |
            |  Orchestrator  |     |  (PostgreSQL +     |    |  (TTS + STT +   |
            |  (WebSocket    |     |   Auth + Storage)  |    |   Voice Clone)  |
            |   Server)      |     +-------------------+    +-----------------+
            +-------+--------+
                    |
        +-----------+-----------+
        |                       |
+-------v--------+     +-------v--------+
| Telephony SIP  |     |   WebSocket    |
| (Twilio/Plivo/ |     |   (Browser)    |
|  Exotel/Telnyx)|     |                |
+----------------+     +----------------+
        |
+-------v--------+
|  PSTN Phone    |
|  Network       |
+----------------+
```

### 1.2 Component Breakdown

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | Next.js 15 (App Router), React 19, TailwindCSS, shadcn/ui | Dashboard, agent management, analytics |
| API Layer | Next.js API Routes (serverless) | REST APIs for CRUD, telephony, WhatsApp |
| Conversation Engine | Custom WebSocket server (Node.js) | Real-time voice pipeline orchestration |
| TTS | MiniMax Speech-02 API (WebSocket streaming) | Text-to-Speech synthesis |
| STT | MiniMax Speech API / Deepgram (fallback) | Speech-to-Text transcription |
| LLM | Claude (Anthropic) / GPT-4o (OpenAI) | Conversational AI intelligence |
| VAD | Silero VAD (client-side) or server-side energy detection | Voice Activity Detection |
| Database | Supabase (PostgreSQL) | Users, agents, calls, transcripts, configs |
| Auth | Supabase Auth | User authentication and session management |
| Storage | Supabase Storage | Audio recordings, uploaded documents |
| Telephony | Twilio/Plivo/Exotel/Telnyx/Vonage (SIP) | Phone number management, PSTN connectivity |
| WhatsApp | Twilio WhatsApp API | Automated follow-up messaging |
| Deployment | Docker, AWS ECR, EC2 | Container-based deployment |

---

## 2. MiniMax API Integration

### 2.1 Text-to-Speech (TTS)

#### 2.1.1 REST API Endpoint
```
POST https://api.minimax.chat/v1/t2a_v2
Headers:
  Authorization: Bearer {MINIMAX_API_KEY}
  Content-Type: application/json

Body:
{
  "model": "speech-02-turbo",
  "text": "Hello, this is Priya from Lumbini Elysee!",
  "voice_setting": {
    "voice_id": "English_Female_Natasha",
    "speed": 1.0,
    "vol": 1.0,
    "pitch": 0,
    "emotion": "happy"
  },
  "audio_setting": {
    "sample_rate": 16000,
    "bitrate": 128000,
    "format": "pcm",
    "channel": 1
  }
}
```

#### 2.1.2 WebSocket Streaming (for real-time conversations)
```
WebSocket: wss://api.minimax.chat/v1/t2a_v2/stream

// Send text chunks as they arrive from LLM
{
  "model": "speech-02-turbo",
  "text": "partial text chunk...",
  "voice_setting": {
    "voice_id": "cloned_voice_xyz",
    "speed": 1.0,
    "emotion": "neutral"
  },
  "audio_setting": {
    "sample_rate": 16000,
    "format": "pcm"
  }
}

// Receive audio chunks in real-time
// Binary frames containing PCM audio data
```

#### 2.1.3 Model Selection
| Model | Latency | Quality | Use Case |
|-------|---------|---------|----------|
| `speech-02-turbo` | <250ms | High | Real-time conversations (default) |
| `speech-02-hd` | ~500ms | Highest | Recordings, non-real-time |
| `speech-02` | ~350ms | High | Balance of speed and quality |

### 2.2 Speech-to-Text (STT)

#### 2.2.1 Streaming STT
```
WebSocket: wss://api.minimax.chat/v1/speech-to-text/stream

// Send audio chunks
// Binary frames containing PCM audio data (16kHz, 16-bit, mono)

// Receive transcription
{
  "text": "I want to know about 3 BHK apartments",
  "is_final": true,
  "confidence": 0.95
}
```

#### 2.2.2 Fallback: Deepgram Nova-2
If MiniMax STT latency or accuracy is insufficient, use Deepgram as fallback:
```
WebSocket: wss://api.deepgram.com/v1/listen
  ?model=nova-2
  &language=en
  &smart_format=true
  &interim_results=true
  &endpointing=300
```

### 2.3 Voice Cloning

#### 2.3.1 Clone Voice API
```
POST https://api.minimax.chat/v1/voice_clone
Headers:
  Authorization: Bearer {MINIMAX_API_KEY}
Content-Type: multipart/form-data

Body:
  file: <audio_file> (min 10 seconds, WAV/MP3/M4A)
  voice_id: "custom_priya_voice" (user-defined identifier)
  description: "Indian female, professional tone"
```

Response:
```json
{
  "voice_id": "cloned_abc123",
  "status": "ready",
  "expires_at": "2026-03-30T00:00:00Z"
}
```

#### 2.3.2 Voice Expiry Management
MiniMax auto-deletes cloned voices after 7 days of inactivity.

**Solution:** Background cron job (every 5 days):
```
1. List all cloned voices from database
2. For each voice, make a minimal TTS request (1 word) to keep it active
3. If voice has expired, re-clone from stored audio file
4. Update voice_id in database if re-cloned
```

Storage schema:
```sql
CREATE TABLE cloned_voices (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  voice_id VARCHAR(255) NOT NULL,        -- MiniMax voice_id
  name VARCHAR(255) NOT NULL,
  description TEXT,
  source_audio_path TEXT NOT NULL,        -- Path in Supabase Storage
  language VARCHAR(10) DEFAULT 'en',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active',           -- active, expired, cloning
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.4 Available Voices

MiniMax provides 300+ built-in voices. Key categories:

| Category | Examples | Languages |
|----------|----------|-----------|
| English Female | Natasha, Aria, Sophie, Emily | en-US, en-GB, en-AU |
| English Male | Marcus, Daniel, James | en-US, en-GB |
| Hindi Female | Ananya, Priya, Diya | hi-IN |
| Hindi Male | Arjun, Rahul | hi-IN |
| Multi-language | Various | 40+ languages |

API to list voices:
```
GET https://api.minimax.chat/v1/voices
```

---

## 3. Real-Time Conversation Engine

### 3.1 Architecture

The conversation engine is the most complex new component. It replaces ElevenLabs' managed Conversational AI with a custom pipeline.

```
Phone/WebSocket Audio Input
        │
        ▼
┌─────────────────┐
│   Audio Buffer   │
│  (Ring Buffer)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   VAD (Voice     │
│   Activity       │
│   Detection)     │
└────────┬────────┘
         │ (speech segments)
         ▼
┌─────────────────┐
│   STT Engine     │──────────────┐
│   (MiniMax /     │              │
│    Deepgram)     │              │
└────────┬────────┘              │
         │ (text)                 │
         ▼                        │ (interrupt signal)
┌─────────────────┐              │
│   LLM Engine     │              │
│   (Claude /      │◄─────────────┘
│    GPT-4o)       │
└────────┬────────┘
         │ (response text, streamed)
         ▼
┌─────────────────┐
│   TTS Engine     │
│   (MiniMax       │
│    WebSocket)    │
└────────┬────────┘
         │ (audio chunks)
         ▼
Phone/WebSocket Audio Output
```

### 3.2 Conversation State Machine

```
                    ┌──────────┐
                    │  IDLE    │
                    └────┬─────┘
                         │ (call connected)
                         ▼
                    ┌──────────┐
              ┌────►│ SPEAKING │ (agent speaks first message)
              │     │ (AGENT)  │
              │     └────┬─────┘
              │          │ (agent finishes / user interrupts)
              │          ▼
              │     ┌──────────┐
              │     │ LISTENING│ (waiting for user input)
              │     │ (USER)   │
              │     └────┬─────┘
              │          │ (user finishes speaking)
              │          ▼
              │     ┌──────────┐
              │     │PROCESSING│ (STT → LLM → TTS)
              │     │          │
              │     └────┬─────┘
              │          │ (response ready)
              └──────────┘
                         │ (silence timeout / call end)
                         ▼
                    ┌──────────┐
                    │   ENDED  │
                    └──────────┘
```

### 3.3 Implementation: WebSocket Server

```typescript
// src/lib/conversation-engine.ts

interface ConversationConfig {
  agentId: string;
  systemPrompt: string;
  firstMessage: string;
  voiceId: string;
  voiceSettings: {
    speed: number;
    pitch: number;
    emotion: string;
  };
  llmModel: string;
  temperature: number;
  maxDurationSeconds: number;
  silenceTimeoutSeconds: number;
  contactName?: string;
}

interface ConversationSession {
  id: string;
  config: ConversationConfig;
  state: 'idle' | 'speaking' | 'listening' | 'processing' | 'ended';
  transcript: { role: string; text: string; timestamp: number }[];
  startedAt: Date;
  audioBuffer: Buffer[];
  sttStream: WebSocket | null;
  ttsStream: WebSocket | null;
}

class ConversationEngine {
  private sessions: Map<string, ConversationSession> = new Map();

  async startSession(config: ConversationConfig): Promise<string> {
    const sessionId = generateId();
    const session: ConversationSession = {
      id: sessionId,
      config,
      state: 'idle',
      transcript: [],
      startedAt: new Date(),
      audioBuffer: [],
      sttStream: null,
      ttsStream: null,
    };

    this.sessions.set(sessionId, session);

    // Initialize MiniMax STT stream
    session.sttStream = new WebSocket('wss://api.minimax.chat/v1/speech-to-text/stream');

    // Initialize MiniMax TTS stream
    session.ttsStream = new WebSocket('wss://api.minimax.chat/v1/t2a_v2/stream');

    // Speak first message
    const firstMsg = config.contactName
      ? config.firstMessage.replace('{{contact_name}}', config.contactName)
      : config.firstMessage;

    await this.speakText(session, firstMsg);
    session.transcript.push({ role: 'agent', text: firstMsg, timestamp: 0 });

    return sessionId;
  }

  async handleAudioInput(sessionId: string, audioChunk: Buffer): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || session.state === 'ended') return;

    // Forward to STT
    if (session.sttStream?.readyState === WebSocket.OPEN) {
      session.sttStream.send(audioChunk);
    }

    // If agent is speaking and user starts talking = interruption
    if (session.state === 'speaking') {
      await this.handleInterruption(session);
    }
  }

  async handleTranscription(session: ConversationSession, text: string, isFinal: boolean): Promise<void> {
    if (!isFinal) return; // Wait for final transcription

    session.state = 'processing';
    session.transcript.push({
      role: 'user',
      text,
      timestamp: (Date.now() - session.startedAt.getTime()) / 1000,
    });

    // Send to LLM
    const response = await this.getLLMResponse(session, text);

    // Speak response
    session.state = 'speaking';
    await this.speakText(session, response);
    session.transcript.push({
      role: 'agent',
      text: response,
      timestamp: (Date.now() - session.startedAt.getTime()) / 1000,
    });

    session.state = 'listening';
  }

  private async getLLMResponse(session: ConversationSession, userText: string): Promise<string> {
    // Build conversation history for LLM
    const messages = session.transcript.map(t => ({
      role: t.role === 'agent' ? 'assistant' as const : 'user' as const,
      content: t.text,
    }));
    messages.push({ role: 'user', content: userText });

    // Call LLM (Claude or GPT)
    // Stream response for lower latency
    const response = await callLLM({
      model: session.config.llmModel,
      systemPrompt: session.config.systemPrompt,
      messages,
      temperature: session.config.temperature,
      maxTokens: 150, // Keep responses short for voice
    });

    return response;
  }

  private async speakText(session: ConversationSession, text: string): Promise<void> {
    // Send to MiniMax TTS WebSocket
    if (session.ttsStream?.readyState === WebSocket.OPEN) {
      session.ttsStream.send(JSON.stringify({
        model: 'speech-02-turbo',
        text,
        voice_setting: {
          voice_id: session.config.voiceId,
          speed: session.config.voiceSettings.speed,
          pitch: session.config.voiceSettings.pitch,
          emotion: session.config.voiceSettings.emotion,
        },
        audio_setting: {
          sample_rate: 16000,
          format: 'pcm',
        },
      }));
    }
  }

  private async handleInterruption(session: ConversationSession): Promise<void> {
    // Stop current TTS output
    session.state = 'listening';
    // Cancel any pending TTS chunks
    // The TTS WebSocket should support cancellation
  }

  async endSession(sessionId: string): Promise<ConversationSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.state = 'ended';

    // Close streams
    session.sttStream?.close();
    session.ttsStream?.close();

    // Store transcript and recording
    this.sessions.delete(sessionId);
    return session;
  }
}
```

### 3.4 Telephony Integration (SIP)

#### 3.4.1 Twilio SIP Trunking
```typescript
// Twilio WebSocket Media Streams
// Receive audio from phone call via WebSocket

// 1. Configure Twilio TwiML to stream audio
const twiml = `
<Response>
  <Connect>
    <Stream url="wss://your-server.com/api/voice/stream">
      <Parameter name="agentId" value="${agentId}" />
      <Parameter name="contactName" value="${contactName}" />
    </Stream>
  </Connect>
</Response>
`;

// 2. Handle WebSocket connection on server
// Receive: mulaw/8000 audio from Twilio
// Send: mulaw/8000 audio back to Twilio

// Audio format conversion:
// Twilio → mulaw/8000Hz → PCM/16000Hz → MiniMax STT
// MiniMax TTS → PCM/16000Hz → mulaw/8000Hz → Twilio
```

#### 3.4.2 Plivo SIP Integration
```typescript
// Plivo uses similar WebSocket-based audio streaming
// phloUrl: Configure Plivo PHLO to stream to WebSocket

const plivoXml = `
<Response>
  <Stream bidirectional="true" url="wss://your-server.com/api/voice/stream">
    <Parameter name="agentId" value="${agentId}" />
  </Stream>
</Response>
`;
```

#### 3.4.3 Outbound Call Flow
```
1. App calls POST /api/calls
2. Server creates call_log record
3. Server initiates outbound call via Twilio/Plivo API
4. Telephony provider connects call + opens WebSocket stream
5. Server starts ConversationEngine session
6. Real-time audio flows: Phone ↔ WebSocket ↔ Engine ↔ MiniMax
7. Call ends → save transcript, trigger WhatsApp auto-send
```

---

## 4. Database Schema (New/Modified Tables)

### 4.1 New Tables

```sql
-- Cloned voices storage
CREATE TABLE cloned_voices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  minimax_voice_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  source_audio_path TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  gender VARCHAR(20),
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cloning', 'expired', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation sessions (replaces ElevenLabs conversation tracking)
CREATE TABLE conversation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  call_log_id UUID REFERENCES call_logs(id),
  session_type TEXT NOT NULL CHECK (session_type IN ('phone', 'web')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'timeout')),
  transcript JSONB,
  duration_seconds INTEGER DEFAULT 0,
  total_turns INTEGER DEFAULT 0,
  tts_characters_used INTEGER DEFAULT 0,
  stt_seconds_used DECIMAL(10,2) DEFAULT 0,
  llm_tokens_used INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice library cache (MiniMax built-in voices)
CREATE TABLE voice_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT DEFAULT 'minimax',
  voice_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  gender VARCHAR(20),
  language VARCHAR(50),
  accent VARCHAR(100),
  category VARCHAR(100),
  preview_url TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  last_synced_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 Modified Tables

```sql
-- agents table: replace ElevenLabs-specific fields
ALTER TABLE agents
  ADD COLUMN tts_provider TEXT DEFAULT 'minimax',
  ADD COLUMN minimax_voice_id VARCHAR(255),
  ADD COLUMN cloned_voice_id UUID REFERENCES cloned_voices(id),
  ADD COLUMN voice_emotion TEXT DEFAULT 'neutral',
  ADD COLUMN voice_pitch INTEGER DEFAULT 0;

-- Remove ElevenLabs dependency (keep for migration period)
-- ALTER TABLE agents DROP COLUMN elevenlabs_agent_id; -- after full migration
```

---

## 5. API Endpoints (New/Modified)

### 5.1 Voice Management

```
GET    /api/voices                    - List MiniMax built-in voices (cached)
GET    /api/voices/preview/:id        - Preview a voice (TTS sample)
POST   /api/voices/clone              - Clone a voice from audio upload
GET    /api/voices/cloned             - List user's cloned voices
DELETE /api/voices/cloned/:id         - Delete a cloned voice
POST   /api/voices/cloned/:id/refresh - Refresh expiring cloned voice
```

### 5.2 Conversation Engine

```
WS     /api/voice/stream             - WebSocket for real-time voice (phone + web)
POST   /api/voice/session/start      - Start a new conversation session
POST   /api/voice/session/:id/end    - End a conversation session
GET    /api/voice/session/:id        - Get session details and transcript
```

### 5.3 Existing Endpoints (No Change)

```
# Agent management
POST   /api/agents                   - Create agent
GET    /api/agents                   - List agents
PATCH  /api/agents/:id              - Update agent
DELETE /api/agents/:id              - Delete agent
POST   /api/agents/:id/deploy       - Deploy agent (modified: no ElevenLabs)

# Telephony
POST   /api/telephony/config        - Save provider credentials
GET    /api/telephony/config        - List configurations
POST   /api/phone-numbers           - Import phone number
GET    /api/phone-numbers           - List phone numbers

# Calls
POST   /api/calls                   - Initiate outbound call
GET    /api/calls                   - List call logs
GET    /api/calls/:id               - Call detail + transcript
GET    /api/calls/:id/recording     - Call recording audio
POST   /api/calls/analyze           - AI analysis
GET    /api/calls/analyze           - Get analysis results

# WhatsApp
POST   /api/whatsapp                - Send WhatsApp message
GET    /api/whatsapp                - List sent messages
POST   /api/whatsapp/auto-send      - Auto-analyze and send

# Campaigns
POST   /api/campaigns               - Create campaign
POST   /api/campaigns/:id/launch    - Launch campaign
```

---

## 6. Audio Processing Pipeline

### 6.1 Audio Format Conversion

```
Telephony (Twilio/Plivo) uses: mulaw, 8kHz, mono
MiniMax TTS outputs:           PCM, 16kHz, 16-bit, mono
MiniMax STT expects:           PCM, 16kHz, 16-bit, mono
WebSocket (browser) uses:      PCM, 16kHz or opus

Conversion chain:
  Phone Input:  mulaw/8kHz → PCM/16kHz (upsample + decode) → MiniMax STT
  Phone Output: MiniMax TTS → PCM/16kHz → mulaw/8kHz (downsample + encode) → Phone

  Web Input:    PCM/16kHz → MiniMax STT
  Web Output:   MiniMax TTS → PCM/16kHz → Browser
```

### 6.2 Libraries Required

```json
{
  "dependencies": {
    "ws": "^8.x",                    // WebSocket server
    "@anthropic-ai/sdk": "^0.x",     // Claude LLM
    "openai": "^4.x",               // GPT-4o fallback
    "wavefile": "^11.x",            // Audio format conversion
    "audiobuffer-to-wav": "^1.x"    // WAV encoding
  }
}
```

---

## 7. Environment Variables

```env
# MiniMax
MINIMAX_API_KEY=                     # MiniMax API key
MINIMAX_GROUP_ID=                    # MiniMax group/org ID

# LLM
ANTHROPIC_API_KEY=                   # Claude API key
OPENAI_API_KEY=                      # GPT-4o fallback (optional)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=
NEXTAUTH_SECRET=

# Deepgram (fallback STT)
DEEPGRAM_API_KEY=                    # Optional fallback
```

---

## 8. Deployment Architecture

### 8.1 Docker Setup

```dockerfile
FROM node:20-slim

# Install audio processing dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build

# Expose HTTP + WebSocket port
EXPOSE 3000

CMD ["node", "server.js"]
```

Note: Requires a custom server.js (not Next.js standalone) to handle WebSocket upgrades for the conversation engine.

### 8.2 Custom Server

```typescript
// server.ts
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer } from 'ws';
import { ConversationEngine } from './src/lib/conversation-engine';

const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();
const engine = new ConversationEngine();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res, parse(req.url!, true));
  });

  // WebSocket server for voice streaming
  const wss = new WebSocketServer({ server, path: '/api/voice/stream' });

  wss.on('connection', (ws, req) => {
    // Handle Twilio/Plivo media streams or browser WebSocket
    engine.handleConnection(ws, req);
  });

  server.listen(3000, () => {
    console.log('Server ready on port 3000');
  });
});
```

### 8.3 Infrastructure Requirements

| Component | Specification |
|-----------|--------------|
| CPU | 4+ vCPUs (for audio processing) |
| RAM | 8+ GB |
| Network | Low latency to MiniMax API servers |
| Storage | 50+ GB for recordings |
| OS | Linux (Debian/Ubuntu) |

---

## 9. Cost Analysis

### 9.1 Per-Call Cost Breakdown (2-minute call)

| Component | ElevenLabs (Current) | MiniMax (New) |
|-----------|---------------------|---------------|
| TTS (~300 chars/response x 6 turns) | ~$0.054 | ~$0.011 |
| STT (2 min audio) | Included | ~$0.006 |
| LLM (Claude, ~2K tokens) | ~$0.006 | ~$0.006 |
| Telephony (Twilio) | ~$0.015 | ~$0.015 |
| **Total per call** | **~$0.075** | **~$0.038** |
| **Monthly (1000 calls)** | **~$75** | **~$38** |

### 9.2 Annual Cost Projection

| Volume | ElevenLabs | MiniMax | Savings |
|--------|-----------|---------|---------|
| 1,000 calls/month | $900/year | $456/year | $444 (49%) |
| 5,000 calls/month | $4,500/year | $2,280/year | $2,220 (49%) |
| 10,000 calls/month | $9,000/year | $4,560/year | $4,440 (49%) |
| 50,000 calls/month | $45,000/year | $22,800/year | $22,200 (49%) |

---

## 10. Migration Strategy

### Phase 1: Parallel Run (Weeks 1-4)
- Build MiniMax TTS/STT integration
- Build conversation engine
- Run alongside ElevenLabs (feature flag toggle)
- A/B test voice quality with internal calls

### Phase 2: Telephony Migration (Weeks 5-7)
- Implement SIP-based calling (Twilio Media Streams)
- Test inbound and outbound calls
- Migrate phone number handling away from ElevenLabs

### Phase 3: Full Migration (Weeks 8-10)
- Switch all new agents to MiniMax
- Migrate existing agents
- Deprecate ElevenLabs API calls

### Phase 4: Cleanup (Weeks 11-12)
- Remove ElevenLabs dependencies
- Delete old ElevenLabs agents
- Update documentation

### Rollback Plan
- Keep ElevenLabs API key active for 3 months post-migration
- Feature flag to switch individual agents back to ElevenLabs
- Database retains elevenlabs_agent_id for rollback

---

## 11. Testing Strategy

### 11.1 Unit Tests
- Audio format conversion (mulaw ↔ PCM)
- VAD detection accuracy
- LLM prompt construction
- Transcript normalization

### 11.2 Integration Tests
- MiniMax TTS API: voice selection, streaming, cloning
- MiniMax STT API: accuracy across accents
- Twilio SIP: call setup, audio streaming, hangup
- End-to-end: phone → STT → LLM → TTS → phone

### 11.3 Performance Tests
- Latency benchmarks: target <1.5s end-to-end
- Concurrent call load: 50+ simultaneous sessions
- Memory usage under load
- WebSocket connection stability over long calls (30+ minutes)

### 11.4 Quality Tests
- Voice quality comparison: MiniMax vs ElevenLabs (blind test)
- STT accuracy: word error rate across Indian English accents
- Interruption handling: barge-in response time
- Turn-taking: no awkward pauses or overlaps

---

## 12. Monitoring & Observability

```typescript
// Key metrics to track
const metrics = {
  // Latency
  'tts.first_byte_ms': 'Time to first TTS audio byte',
  'stt.transcription_ms': 'Time to final transcription',
  'llm.response_ms': 'Time to LLM first token',
  'e2e.response_ms': 'End-to-end voice-in to voice-out',

  // Quality
  'stt.confidence': 'STT confidence score',
  'call.duration_seconds': 'Call duration',
  'call.turns': 'Number of conversation turns',

  // Errors
  'tts.errors': 'TTS API errors',
  'stt.errors': 'STT API errors',
  'call.drops': 'Unexpected call disconnections',

  // Cost
  'tts.characters': 'TTS characters consumed',
  'stt.seconds': 'STT audio seconds processed',
  'llm.tokens': 'LLM tokens used',
};
```

---

## 13. Security Considerations

- MiniMax API key stored in environment variables (never in client code)
- Audio streams encrypted via WSS (WebSocket Secure)
- Call recordings encrypted at rest in Supabase Storage
- Cloned voice audio files access-controlled per user
- No PII in conversation engine logs (only session IDs)
- Rate limiting on voice clone API (prevent abuse)

---

## 14. Open Questions

1. **MiniMax STT quality for Indian English** — needs benchmarking; may need Deepgram as fallback
2. **MiniMax WebSocket streaming reliability** — needs load testing under concurrent connections
3. **Voice cloning 7-day expiry** — is there an enterprise plan without this limit?
4. **Latency from India to MiniMax servers** — need to test; may need API gateway in Asia region
5. **MiniMax rate limits** — what are the concurrent request limits?
6. **Custom server vs serverless** — WebSocket server needs persistent connections; can't use pure serverless
