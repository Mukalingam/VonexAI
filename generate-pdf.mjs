import PDFDocument from "pdfkit";
import fs from "fs";

const doc = new PDFDocument({ size: "A4", margins: { top: 50, bottom: 50, left: 55, right: 55 } });
doc.pipe(fs.createWriteStream("VonexAI_Product_Overview.pdf"));

const orange = "#DE6C33";
const indigo = "#2E3192";
const dark = "#1a1a2e";
const gray = "#555555";
const lightGray = "#888888";
const pageW = 595.28;
const contentW = 595.28 - 110;

// ============ PAGE 1 ============

// Header
doc.fontSize(24).font("Helvetica-Bold").fillColor(orange).text("Vonex AI", 55, 50);
doc.fontSize(9).font("Helvetica").fillColor(lightGray).text("Product Overview | March 2026", 55, 78);
doc.moveTo(55, 95).lineTo(pageW - 55, 95).strokeColor("#dddddd").lineWidth(1).stroke();

// Tagline
doc.fontSize(18).font("Helvetica-Bold").fillColor(dark).text("Intelligent Voice Automation for Every Business", 55, 115, { width: contentW });

doc.fontSize(10).font("Helvetica").fillColor(gray).text(
  "Vonex AI is a full-stack AI voice agent platform that enables businesses to create, deploy, and manage intelligent voice and chat agents. Build human-like conversational AI for phone calling, web chat, and multi-channel customer engagement — powered by state-of-the-art LLMs and ElevenLabs voice technology.",
  55, 148, { width: contentW, lineGap: 3 }
);

// Access Box
const boxY = 210;
doc.roundedRect(55, boxY, contentW, 80, 6).fillAndStroke("#f7f7fa", "#dddddd");
doc.fontSize(10).font("Helvetica-Bold").fillColor(indigo).text("Application Access", 70, boxY + 12);
doc.fontSize(9.5).font("Helvetica").fillColor(dark);
doc.text("URL:", 70, boxY + 32, { continued: true }).font("Helvetica-Bold").text("  https://voxahub.icognito.ai/");
doc.font("Helvetica").text("Login ID:", 70, boxY + 48, { continued: true }).font("Helvetica-Bold").text("  muka.u@iicl.in");
doc.font("Helvetica").text("Password:", 70, boxY + 64, { continued: true }).font("Helvetica-Bold").text("  Muk@1820");

// Core Features heading
doc.fontSize(14).font("Helvetica-Bold").fillColor(dark).text("Core Features", 55, 315);
doc.moveTo(55, 333).lineTo(140, 333).strokeColor(orange).lineWidth(2).stroke();

const features = [
  {
    title: "AI Voice Agents",
    desc: "Create human-like voice agents with custom personas, multi-language support, and natural conversation flow. Choose from premium ElevenLabs voice profiles with adjustable stability, speed, and similarity settings."
  },
  {
    title: "Phone Calling (Inbound & Outbound)",
    desc: "Make and receive AI-powered phone calls via Twilio integration. Track call duration, transcripts, audio recordings, sentiment analysis, and success rates in real-time."
  },
  {
    title: "Web Chat Agents",
    desc: "Deploy conversational AI on any website via embeddable widgets, iframes, or REST API. Includes real-time WebSocket communication, conversation history, and debug panel."
  },
  {
    title: "Outbound Campaigns",
    desc: "Launch automated calling campaigns with CSV contact upload, configurable retry logic (0-3 attempts), calling hours scheduling, and real-time progress tracking with success metrics."
  },
  {
    title: "Analytics & Dashboard",
    desc: "Multi-tab dashboards with call volume charts, agent leaderboards, call duration distribution, sentiment analysis, peak calling hours heatmaps, and conversation metrics."
  },
  {
    title: "Knowledge Base",
    desc: "Upload documents (PDF, DOCX, TXT, CSV, JSON), add web URLs, and create FAQ pairs. Automatic indexing enables agents to answer domain-specific questions accurately."
  },
];

let y = 348;
for (const f of features) {
  doc.fontSize(10.5).font("Helvetica-Bold").fillColor(indigo).text(f.title, 70, y, { width: contentW - 20 });
  y = doc.y + 3;
  doc.fontSize(9).font("Helvetica").fillColor(gray).text(f.desc, 70, y, { width: contentW - 20, lineGap: 2 });
  y = doc.y + 12;
}

// Footer page 1
doc.fontSize(8).font("Helvetica").fillColor(lightGray).text("Vonex AI by iCognito Technologies", 55, 770);
doc.text("Page 1 of 2", pageW - 115, 770);

// ============ PAGE 2 ============
doc.addPage();

// Header
doc.fontSize(24).font("Helvetica-Bold").fillColor(orange).text("Vonex AI", 55, 50);
doc.fontSize(9).font("Helvetica").fillColor(lightGray).text("Detailed Capabilities", 55, 78);
doc.moveTo(55, 95).lineTo(pageW - 55, 95).strokeColor("#dddddd").lineWidth(1).stroke();

// Agent Creation
y = 110;
doc.fontSize(12).font("Helvetica-Bold").fillColor(dark).text("Agent Creation & Management", 55, y);
doc.moveTo(55, y + 16).lineTo(210, y + 16).strokeColor(orange).lineWidth(2).stroke();
y += 25;

const agentFeatures = [
  "7-step guided creation wizard: Channel, Domain, Persona, Voice, Knowledge Base, Advanced Settings, Review & Deploy",
  "17 industry domains: Healthcare, Real Estate, Sales, Insurance, Banking, E-commerce, Hospitality, Legal, and more",
  "Custom system prompts, personality traits, temperature controls, and response style configuration",
  "One-click deploy & redeploy to ElevenLabs with automatic phone number reassignment",
  "Agent testing with full chat interface, conversation history, and debug panel with session metrics",
  "Integration options: Shareable link, Embed widget (iframe/JS), REST API, and Webhook events",
];

for (const item of agentFeatures) {
  doc.circle(62, y + 4, 2).fill(orange);
  doc.fontSize(9).font("Helvetica").fillColor(gray).text(item, 70, y, { width: contentW - 20, lineGap: 1 });
  y = doc.y + 6;
}

// Supported Models
y += 6;
doc.fontSize(12).font("Helvetica-Bold").fillColor(dark).text("Supported AI Models", 55, y);
doc.moveTo(55, y + 16).lineTo(185, y + 16).strokeColor(orange).lineWidth(2).stroke();
y += 26;

const models = [
  ["Claude:", "Sonnet 4.5, Sonnet 4, Haiku 4.5, 3.5 Sonnet, 3 Haiku"],
  ["OpenAI:", "GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-3.5 Turbo"],
  ["Google:", "Gemini 2.5 Flash, 2.0 Flash, 1.5 Pro, 1.5 Flash"],
  ["DeepSeek:", "DeepSeek R1 (Custom LLM)"],
];

for (const [label, value] of models) {
  doc.fontSize(9).font("Helvetica-Bold").fillColor(indigo).text(label, 70, y, { continued: true })
    .font("Helvetica").fillColor(gray).text("  " + value);
  y = doc.y + 4;
}

// Pricing
y += 10;
doc.fontSize(12).font("Helvetica-Bold").fillColor(dark).text("Pricing Plans", 55, y);
doc.moveTo(55, y + 16).lineTo(140, y + 16).strokeColor(orange).lineWidth(2).stroke();
y += 28;

const planX = [55, 225, 395];
const planW = 150;
const plans = [
  { name: "Free", price: "$0 / forever", items: ["Up to 3 agents", "1,000 API calls/mo", "100MB storage", "Basic analytics", "Standard voices"] },
  { name: "Pro", price: "$49 / month", items: ["Up to 25 agents", "50,000 API calls/mo", "5GB storage", "Premium voices", "Custom domains & Webhooks"] },
  { name: "Enterprise", price: "Custom", items: ["Unlimited agents & calls", "50GB storage", "HIPAA & SSO/SAML", "Custom voice cloning", "Dedicated support & SLA"] },
];

const planStartY = y;
for (let i = 0; i < 3; i++) {
  const p = plans[i];
  const px = planX[i];
  const borderColor = i === 1 ? indigo : "#dddddd";
  doc.roundedRect(px, planStartY, planW, 130, 5).strokeColor(borderColor).lineWidth(i === 1 ? 1.5 : 1).stroke();
  doc.fontSize(11).font("Helvetica-Bold").fillColor(dark).text(p.name, px + 12, planStartY + 10, { width: planW - 24 });
  doc.fontSize(10).font("Helvetica-Bold").fillColor(indigo).text(p.price, px + 12, planStartY + 26, { width: planW - 24 });
  let iy = planStartY + 48;
  for (const item of p.items) {
    doc.circle(px + 16, iy + 4, 2).fill(orange);
    doc.fontSize(8.5).font("Helvetica").fillColor(gray).text(item, px + 24, iy, { width: planW - 40 });
    iy = doc.y + 3;
  }
}

// Integrations
y = planStartY + 145;
doc.fontSize(12).font("Helvetica-Bold").fillColor(dark).text("Integrations & Infrastructure", 55, y);
doc.moveTo(55, y + 16).lineTo(215, y + 16).strokeColor(orange).lineWidth(2).stroke();
y += 28;

const integrations = [
  "ElevenLabs — Voice AI engine for agent deployment, voice synthesis, and conversational AI",
  "Twilio — Phone calling infrastructure for inbound/outbound calls and phone number management",
  "Supabase — Backend database, authentication, row-level security, and real-time subscriptions",
  "AWS EC2 + ECR — Production hosting with Docker containerization and auto-deployment",
  "WebSocket — Real-time bidirectional communication for live chat and agent testing",
];

for (const item of integrations) {
  doc.circle(62, y + 4, 2).fill(orange);
  doc.fontSize(9).font("Helvetica").fillColor(gray).text(item, 70, y, { width: contentW - 20, lineGap: 1 });
  y = doc.y + 5;
}

// Account
y += 8;
doc.fontSize(12).font("Helvetica-Bold").fillColor(dark).text("Account & Settings", 55, y);
doc.moveTo(55, y + 16).lineTo(170, y + 16).strokeColor(orange).lineWidth(2).stroke();
y += 26;

const account = [
  "User profile with avatar, company info, and timezone — API key management with secure masking",
  "Billing dashboard with usage meters for agents, API calls, and storage limits",
  "Phone number management: import Twilio numbers, assign agents, set friendly names",
  "Password management and account deletion with confirmation safeguards",
];

for (const item of account) {
  doc.circle(62, y + 4, 2).fill(orange);
  doc.fontSize(9).font("Helvetica").fillColor(gray).text(item, 70, y, { width: contentW - 20, lineGap: 1 });
  y = doc.y + 5;
}

// Footer page 2
doc.fontSize(8).font("Helvetica").fillColor(lightGray).text("CONFIDENTIAL — Vonex AI by iCognito Technologies — March 2026", 55, 770);
doc.text("Page 2 of 2", pageW - 115, 770);

doc.end();
console.log("PDF generated: VonexAI_Product_Overview.pdf");
