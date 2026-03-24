import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const sections = [
  {
    title: "Getting Started",
    description: "Set up your first AI voice agent in minutes",
    items: [
      {
        title: "1. Create an Account",
        content:
          "Sign up for Vonex AI and verify your email. You get a free tier with limited usage to explore the platform.",
      },
      {
        title: "2. Create an Agent",
        content:
          'Click "Create New Agent" from the dashboard. Choose a domain (Sales, Healthcare, Support, etc.), configure the personality, set up the voice, and add knowledge base content.',
      },
      {
        title: "3. Test Your Agent",
        content:
          "Use the built-in chat interface to test your agent with text or voice. Fine-tune the system prompt and personality traits until you are satisfied.",
      },
      {
        title: "4. Deploy & Integrate",
        content:
          "Deploy your agent and use the Integrations page to get a share link, embed widget code, or API endpoints to integrate into your website or application.",
      },
    ],
  },
  {
    title: "Voice Configuration",
    description: "Configure natural-sounding voices for your agents",
    items: [
      {
        title: "Text-to-Speech (TTS)",
        content:
          "Vonex AI uses advanced AI for high-quality voice synthesis. Choose from a library of 5,000+ voices, select gender, and fine-tune speed and stability settings.",
      },
      {
        title: "Speech-to-Text (STT)",
        content:
          "Voice input is automatically transcribed using advanced speech recognition. The always-on microphone feature uses Voice Activity Detection (VAD) to auto-detect speech.",
      },
      {
        title: "Always-On Microphone",
        content:
          'Enable the always-on mic mode for hands-free conversation. The agent listens continuously, detects when you speak, records your message, and responds automatically. Click the radio icon (📡) in the chat footer to toggle.',
      },
    ],
  },
  {
    title: "Knowledge Base",
    description: "Teach your agents with custom knowledge",
    items: [
      {
        title: "Supported Content Types",
        content:
          "Upload PDF, DOCX, TXT, CSV, or JSON files. Add URLs for the agent to learn from. Create FAQ pairs for common questions. Add custom text instructions.",
      },
      {
        title: "How It Works",
        content:
          "Knowledge base content is automatically extracted and injected into the agent's context when conversations happen. The agent uses this information to provide accurate, domain-specific responses.",
      },
    ],
  },
  {
    title: "Integration Options",
    description: "Embed your agent anywhere",
    items: [
      {
        title: "Share Link",
        content:
          "Enable public access on your agent and share a direct link. Anyone with the link can chat with your agent without an account.",
      },
      {
        title: "Embed Widget",
        content:
          "Copy the JavaScript snippet and add it to any website. A floating chat button appears in the bottom-right corner that opens a full chat interface in an iframe.",
      },
      {
        title: "REST API",
        content:
          "Use the API endpoints to build custom integrations. Send POST requests to the chat endpoint with a message and get responses with text and optional audio.",
      },
      {
        title: "Webhooks",
        content:
          "Configure webhook URLs to receive real-time notifications for events like conversation started, message received, message sent, and conversation ended.",
      },
    ],
  },
  {
    title: "API Reference",
    description: "Endpoints for programmatic access",
    items: [
      {
        title: "POST /api/public/agents/{id}/chat",
        content:
          'Send a JSON body with { "message": "your text", "conversation_id": "optional" }. Returns { "text": "agent response", "audio_url": "optional TTS audio", "conversation_id": "id" }.',
      },
      {
        title: "POST /api/public/agents/{id}/chat/voice",
        content:
          'Send a multipart/form-data with an "audio" file field and optional "conversation_id". Returns the agent\'s text response, audio URL, and transcription of the user\'s speech.',
      },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight">Documentation</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Everything you need to build, deploy, and integrate AI voice agents
              with Vonex AI.
            </p>
          </div>

          <div className="space-y-12">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-bold">{section.title}</h2>
                <p className="mt-1 text-muted-foreground">
                  {section.description}
                </p>
                <div className="mt-4 grid gap-4">
                  {section.items.map((item) => (
                    <Card key={item.title}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {item.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
