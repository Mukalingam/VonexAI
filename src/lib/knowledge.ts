import { SupabaseClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";

// In-memory cache for knowledge base context with 5-minute TTL
const knowledgeCache = new Map<string, { data: string; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Invalidate the cached knowledge context for a specific agent.
 */
export function invalidateKnowledgeCache(agentId: string) {
  knowledgeCache.delete(agentId);
}

/**
 * Fetch and build knowledge context string for an agent's system prompt.
 */
export async function fetchKnowledgeContext(
  supabase: SupabaseClient,
  agentId: string
): Promise<string> {
  // Check cache first
  const cached = knowledgeCache.get(agentId);
  if (cached && Date.now() < cached.expiresAt) return cached.data;

  const { data: kbItems } = await supabase
    .from("knowledge_bases")
    .select("source_type, content, source_url, file_path, metadata")
    .eq("agent_id", agentId);

  if (!kbItems || kbItems.length === 0) return "";

  const kbParts: string[] = [];

  for (const item of kbItems) {
    if (!item.content) continue;

    if (item.source_type === "faq") {
      try {
        const faq = JSON.parse(item.content);
        kbParts.push(`Q: ${faq.question}\nA: ${faq.answer}`);
      } catch {
        kbParts.push(item.content);
      }
    } else if (item.source_type === "url") {
      kbParts.push(
        `[Source: ${item.source_url || "web"}]\n${item.content}`
      );
    } else if (item.source_type === "file") {
      const fileName =
        (item.metadata as Record<string, string>)?.original_name ||
        item.file_path ||
        "document";
      kbParts.push(`[File: ${fileName}]\n${item.content}`);
    } else {
      kbParts.push(item.content);
    }
  }

  if (kbParts.length === 0) {
    knowledgeCache.set(agentId, { data: "", expiresAt: Date.now() + CACHE_TTL_MS });
    return "";
  }

  const result = `\n\nKNOWLEDGE BASE:
Use the following information to answer questions accurately. If the answer is found in the knowledge base, always prefer it over your general knowledge.

${kbParts.join("\n\n---\n\n")}`;

  knowledgeCache.set(agentId, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
  return result;
}

/**
 * Extract text content from an uploaded file buffer.
 * Supports text formats, PDF (with OCR fallback), DOCX, and images.
 */
export async function extractFileContent(
  buffer: ArrayBuffer | Buffer,
  extension: string
): Promise<string> {
  const ext = extension.toLowerCase().replace(".", "");

  switch (ext) {
    case "txt":
    case "csv":
    case "md": {
      const decoder = new TextDecoder("utf-8");
      return decoder.decode(buffer);
    }

    case "json": {
      const decoder = new TextDecoder("utf-8");
      const raw = decoder.decode(buffer);
      try {
        const parsed = JSON.parse(raw);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return raw;
      }
    }

    case "pdf": {
      return extractPdfContent(buffer);
    }

    case "docx": {
      try {
        const mammoth = await import("mammoth");
        const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(new Uint8Array(buffer));
        const result = await mammoth.extractRawText({ buffer: nodeBuffer });
        return result.value || "";
      } catch (err) {
        console.error("DOCX parsing failed:", err);
        return "";
      }
    }

    // Image files — run OCR directly
    case "jpg":
    case "jpeg":
    case "png":
    case "webp":
    case "bmp":
    case "tiff":
    case "tif": {
      return extractImageText(buffer);
    }

    default:
      return "";
  }
}

/**
 * Extract text from a PDF. Uses pdf-parse first; if the PDF is image-based
 * (scanned/brochure), falls back to OCR via Tesseract.
 */
async function extractPdfContent(buffer: ArrayBuffer | Buffer): Promise<string> {
  const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(new Uint8Array(buffer));

  // Step 1: Try pdf-parse for text-based PDFs
  let textContent = "";
  try {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as any).default || pdfParseModule;
    const data = await pdfParse(nodeBuffer);
    textContent = (data.text || "").trim();
  } catch (err) {
    console.error("PDF text parsing failed:", err);
  }

  // If we got meaningful text (more than just whitespace/page numbers), return it
  const meaningfulText = textContent.replace(/[\s\d\n]+/g, "").trim();
  if (meaningfulText.length > 100) {
    return textContent;
  }

  // Step 2: PDF is image-based — convert pages to images and OCR them
  console.log("[KB] PDF has little text, attempting OCR...");
  try {
    const ocrText = await ocrPdfPages(nodeBuffer);
    if (ocrText.trim().length > 50) {
      // Combine any text-layer content with OCR results
      const combined = textContent
        ? `${textContent}\n\n--- OCR Extracted Content ---\n\n${ocrText}`
        : ocrText;
      return combined;
    }
  } catch (ocrErr) {
    console.error("[KB] PDF OCR failed:", ocrErr);
  }

  // Return whatever we have, even if minimal
  return textContent;
}

/**
 * Convert PDF pages to images and run OCR on each page.
 * Uses pdf.js to render pages to canvas, then Tesseract for OCR.
 */
async function ocrPdfPages(pdfBuffer: Buffer): Promise<string> {
  // Dynamic imports
  const sharp = (await import("sharp")).default;

  // Use pdf-parse to get page count, then use a simpler approach:
  // Convert the entire PDF to images using sharp (for single-page) or
  // use pdf.js for multi-page rendering
  let pageTexts: string[] = [];

  try {
    // Try to convert PDF pages to images using pdf2pic-like approach with sharp
    // Sharp can handle PDFs if libvips was compiled with poppler support,
    // but on most systems we need a different approach.
    // Instead, we'll use the pdf-parse numpages info and try sharp on each page.

    // Approach: Use pdf.js (pdfjs-dist) for rendering if available,
    // otherwise fall back to treating the PDF buffer as an image with sharp
    // (works for single-page PDFs on some systems)

    // First attempt: Try sharp directly (works if PDF is single-page or system has poppler)
    try {
      const pages = await sharp(pdfBuffer, { pages: -1 }).metadata();
      const numPages = pages.pages || 1;

      for (let i = 0; i < Math.min(numPages, 20); i++) {
        try {
          const imgBuffer = await sharp(pdfBuffer, { page: i })
            .resize(2000, undefined, { fit: "inside", withoutEnlargement: true })
            .png()
            .toBuffer();

          const text = await runOcrOnImage(imgBuffer);
          if (text.trim()) {
            pageTexts.push(`[Page ${i + 1}]\n${text.trim()}`);
          }
        } catch {
          // Skip unreadable pages
        }
      }
    } catch {
      // Sharp can't handle this PDF — try extracting embedded images
      console.log("[KB] Sharp PDF rendering unavailable, trying embedded image extraction...");
      const embeddedText = await extractEmbeddedImagesFromPdf(pdfBuffer);
      if (embeddedText) {
        pageTexts.push(embeddedText);
      }
    }
  } catch (err) {
    console.error("[KB] PDF to image conversion failed:", err);
  }

  return pageTexts.join("\n\n");
}

/**
 * Try to extract and OCR embedded images from a PDF using basic stream parsing.
 */
async function extractEmbeddedImagesFromPdf(pdfBuffer: Buffer): Promise<string> {
  // Look for JPEG and PNG signatures in the PDF buffer
  const jpegSignature = Buffer.from([0xff, 0xd8, 0xff]);
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

  const images: Buffer[] = [];
  let offset = 0;

  while (offset < pdfBuffer.length - 10 && images.length < 20) {
    // Look for JPEG
    const jpegIdx = pdfBuffer.indexOf(jpegSignature, offset);
    const pngIdx = pdfBuffer.indexOf(pngSignature, offset);

    if (jpegIdx === -1 && pngIdx === -1) break;

    if (jpegIdx !== -1 && (pngIdx === -1 || jpegIdx < pngIdx)) {
      // Found JPEG — find end marker (FFD9)
      const endMarker = Buffer.from([0xff, 0xd9]);
      const endIdx = pdfBuffer.indexOf(endMarker, jpegIdx + 3);
      if (endIdx !== -1 && endIdx - jpegIdx > 1000) {
        // Only extract images > 1KB (skip tiny thumbnails)
        images.push(pdfBuffer.subarray(jpegIdx, endIdx + 2));
      }
      offset = (endIdx !== -1 ? endIdx + 2 : jpegIdx + 3);
    } else if (pngIdx !== -1) {
      // Found PNG — find IEND chunk
      const iendMarker = Buffer.from("IEND");
      const endIdx = pdfBuffer.indexOf(iendMarker, pngIdx + 8);
      if (endIdx !== -1 && endIdx - pngIdx > 1000) {
        images.push(pdfBuffer.subarray(pngIdx, endIdx + 8));
      }
      offset = (endIdx !== -1 ? endIdx + 8 : pngIdx + 8);
    } else {
      break;
    }
  }

  if (images.length === 0) return "";

  console.log(`[KB] Found ${images.length} embedded images in PDF, running OCR...`);

  const results: string[] = [];
  for (let i = 0; i < images.length; i++) {
    try {
      const text = await runOcrOnImage(images[i]);
      if (text.trim().length > 20) {
        results.push(`[Image ${i + 1}]\n${text.trim()}`);
      }
    } catch {
      // Skip failed OCR
    }
  }

  return results.join("\n\n");
}

/**
 * Run OCR on a single image buffer using Tesseract.js.
 */
async function runOcrOnImage(imageBuffer: Buffer): Promise<string> {
  const Tesseract = await import("tesseract.js");
  const worker = await Tesseract.createWorker("eng");

  try {
    const { data: { text } } = await worker.recognize(imageBuffer);
    return text || "";
  } finally {
    await worker.terminate();
  }
}

/**
 * Extract text from an image file using OCR (Tesseract.js).
 * Pre-processes the image with sharp for better OCR accuracy.
 */
async function extractImageText(buffer: ArrayBuffer | Buffer): Promise<string> {
  const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(new Uint8Array(buffer));

  try {
    const sharp = (await import("sharp")).default;

    // Pre-process: convert to grayscale, sharpen, resize for better OCR
    const processedBuffer = await sharp(nodeBuffer)
      .resize(3000, undefined, { fit: "inside", withoutEnlargement: true })
      .grayscale()
      .sharpen()
      .normalize()
      .png()
      .toBuffer();

    const text = await runOcrOnImage(processedBuffer);
    return text.trim();
  } catch (err) {
    console.error("[KB] Image OCR failed:", err);
    // Try raw OCR without pre-processing
    try {
      const text = await runOcrOnImage(nodeBuffer);
      return text.trim();
    } catch {
      return "";
    }
  }
}

// ============================================================
// URL Content Extraction
// ============================================================

/**
 * Fetch content from a URL with a two-tier strategy:
 * 1. Fast: lightweight fetch + cheerio (for static pages)
 * 2. Fallback: Puppeteer headless browser (for JS-rendered pages)
 * 3. Content is cleaned with @mozilla/readability when available
 */
export async function fetchUrlContent(url: string): Promise<string> {
  // Tier 1: Try lightweight fetch first
  const lightweightContent = await fetchUrlLightweight(url);
  if (lightweightContent && lightweightContent.length >= 200) {
    return lightweightContent;
  }

  // Tier 2: Use Puppeteer for JS-rendered pages
  console.log(`[KB] Lightweight fetch got insufficient content for ${url}, trying Puppeteer...`);
  const puppeteerContent = await fetchUrlWithPuppeteer(url);
  if (puppeteerContent && puppeteerContent.length >= 50) {
    return puppeteerContent;
  }

  // Return whatever we got from the lightweight fetch
  return lightweightContent || "";
}

/**
 * Lightweight URL fetch using fetch + cheerio + Readability.
 */
async function fetchUrlLightweight(url: string): Promise<string> {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  ];

  let lastError = "";

  for (let attempt = 0; attempt < userAgents.length; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": userAgents[attempt],
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain,application/json,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "identity",
          "Cache-Control": "no-cache",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        lastError = `HTTP ${res.status} ${res.statusText}`;
        continue;
      }

      const contentType = res.headers.get("content-type") || "";
      const text = await res.text();

      if (!text || text.trim().length === 0) {
        lastError = "Empty response body";
        continue;
      }

      // Handle JSON responses
      if (contentType.includes("application/json")) {
        try {
          return JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          return text;
        }
      }

      // Handle plain text
      if (contentType.includes("text/plain")) {
        return text.trim();
      }

      // Handle HTML — try Readability first, fall back to cheerio
      const readabilityContent = await extractWithReadability(text, url);
      if (readabilityContent && readabilityContent.length >= 100) {
        return readabilityContent;
      }

      // Fallback to cheerio extraction
      const extracted = extractHtmlContent(text, url);
      if (extracted.length >= 50) {
        return extracted;
      }

      lastError = "Could not extract meaningful content (site may require JavaScript)";
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Fetch failed";
    }
  }

  console.error(`URL lightweight fetch failed for ${url}: ${lastError}`);
  return "";
}

/**
 * Extract article content using @mozilla/readability + jsdom.
 * Produces clean, readable text from HTML.
 */
async function extractWithReadability(html: string, url: string): Promise<string> {
  try {
    const { Readability } = await import("@mozilla/readability");
    const { JSDOM } = await import("jsdom");

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) return "";

    const parts: string[] = [];

    if (article.title) {
      parts.push(`# ${article.title}`);
    }
    if (article.byline) {
      parts.push(`By: ${article.byline}`);
    }
    if (article.excerpt && article.excerpt !== article.title) {
      parts.push(article.excerpt);
    }

    // Convert HTML content to plain text with structure
    if (article.textContent) {
      const cleaned = article.textContent
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]+/g, " ")
        .trim();
      parts.push(cleaned);
    }

    const result = parts.join("\n\n").trim();

    // Limit to ~50KB
    if (result.length > 50000) {
      return result.slice(0, 50000) + "\n\n[Content truncated]";
    }

    return result;
  } catch (err) {
    console.error("[KB] Readability extraction failed:", err);
    return "";
  }
}

/**
 * Fetch URL content using Puppeteer headless browser.
 * Handles JavaScript-rendered pages (SPAs, React/Angular sites, etc.)
 */
async function fetchUrlWithPuppeteer(url: string): Promise<string> {
  let browser = null;

  try {
    const puppeteer = await import("puppeteer");
    browser = await puppeteer.default.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
      ],
    });

    const page = await browser.newPage();

    // Set realistic viewport and user agent
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    );

    // Block heavy resources to speed up loading
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navigate and wait for content
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 45000,
    });

    // Wait a bit for any late-loading JS content
    await page.waitForSelector("body", { timeout: 5000 }).catch(() => {});

    // Get the fully rendered HTML
    const html = await page.content();

    // Try Readability on the rendered HTML
    const readabilityContent = await extractWithReadability(html, url);
    if (readabilityContent && readabilityContent.length >= 100) {
      return readabilityContent;
    }

    // Fallback: extract with cheerio
    const cheerioContent = extractHtmlContent(html, url);
    if (cheerioContent.length >= 50) {
      return cheerioContent;
    }

    // Last resort: extract all visible text from the page
    const visibleText = await page.evaluate(() => {
      const body = document.body;
      if (!body) return "";

      // Remove non-content elements
      const removeSelectors = "script, style, noscript, iframe, svg, nav, footer, header";
      body.querySelectorAll(removeSelectors).forEach((el) => el.remove());

      return body.innerText || "";
    });

    const cleaned = visibleText
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+/g, " ")
      .trim();

    if (cleaned.length > 50000) {
      return cleaned.slice(0, 50000) + "\n\n[Content truncated]";
    }

    return cleaned;
  } catch (err) {
    console.error(`[KB] Puppeteer fetch failed for ${url}:`, err);
    return "";
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Ignore close errors
      }
    }
  }
}

/**
 * Extract meaningful text content from HTML using cheerio.
 */
function extractHtmlContent(html: string, url: string): string {
  const $ = cheerio.load(html);

  // Remove non-content elements
  $("script, style, noscript, iframe, svg, canvas, nav, footer, header").remove();
  $("[style*='display:none'], [style*='display: none'], [hidden], .hidden, .d-none").remove();
  $("form, button, input, select, textarea").remove();

  const parts: string[] = [];

  // 1. Extract page title
  const title = $("title").text().trim();
  if (title) {
    parts.push(`Title: ${title}`);
  }

  // 2. Extract meta description & OG data
  const metaDesc = $('meta[name="description"]').attr("content")?.trim();
  const ogDesc = $('meta[property="og:description"]').attr("content")?.trim();
  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim();

  if (ogTitle && ogTitle !== title) {
    parts.push(ogTitle);
  }
  if (metaDesc) {
    parts.push(metaDesc);
  } else if (ogDesc) {
    parts.push(ogDesc);
  }

  // 3. Extract structured data (JSON-LD)
  $('script[type="application/ld+json"]').each((_i: number, el: unknown) => {
    try {
      const jsonLd = JSON.parse($(el as string).html() || "");
      const ldText = extractJsonLdText(jsonLd);
      if (ldText) parts.push(ldText);
    } catch {
      // ignore invalid JSON-LD
    }
  });

  // 4. Extract main content areas (prefer article, main, [role=main])
  const mainSelectors = [
    "article",
    "main",
    "[role='main']",
    ".content",
    ".post-content",
    ".article-content",
    ".entry-content",
    "#content",
    "#main-content",
  ];

  let mainContent = "";
  for (const sel of mainSelectors) {
    const el = $(sel).first();
    if (el.length) {
      mainContent = extractTextFromElement($, el);
      if (mainContent.length > 100) break;
    }
  }

  if (mainContent.length > 100) {
    parts.push(mainContent);
  } else {
    // Fallback: extract from body, focusing on content-bearing elements
    const bodyText = extractTextFromElement($, $("body"));
    if (bodyText) parts.push(bodyText);
  }

  // 5. Deduplicate, clean up, and limit size
  const combined = parts
    .filter(Boolean)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  // Limit to ~50KB of text content to avoid storing huge pages
  const maxLength = 50000;
  if (combined.length > maxLength) {
    return combined.slice(0, maxLength) + "\n\n[Content truncated]";
  }

  return combined;
}

/**
 * Extract readable text from a cheerio element, preserving structure.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTextFromElement($: cheerio.CheerioAPI, el: any): string {
  const lines: string[] = [];

  // Extract headings with emphasis
  el.find("h1, h2, h3, h4, h5, h6").each((_i: number, heading: unknown) => {
    const text = $(heading as string).text().trim();
    if (text) lines.push(`\n## ${text}`);
  });

  // Extract paragraphs
  el.find("p").each((_i: number, p: unknown) => {
    const text = $(p as string).text().trim();
    if (text && text.length > 10) lines.push(text);
  });

  // Extract list items
  el.find("li").each((_i: number, li: unknown) => {
    const text = $(li as string).text().trim();
    if (text && text.length > 5) lines.push(`- ${text}`);
  });

  // Extract table data
  el.find("table").each((_i: number, table: unknown) => {
    const rows: string[] = [];
    $(table as string).find("tr").each((_j: number, tr: unknown) => {
      const cells: string[] = [];
      $(tr as string).find("th, td").each((_k: number, cell: unknown) => {
        cells.push($(cell as string).text().trim());
      });
      if (cells.some(c => c.length > 0)) {
        rows.push(cells.join(" | "));
      }
    });
    if (rows.length > 0) lines.push(rows.join("\n"));
  });

  // If structured extraction yielded little, fall back to full text
  const structured = lines.join("\n").trim();
  if (structured.length < 100) {
    return el.text().replace(/\s{2,}/g, " ").trim();
  }

  return structured;
}

/**
 * Extract useful text from JSON-LD structured data.
 */
function extractJsonLdText(data: unknown): string {
  if (!data || typeof data !== "object") return "";

  const parts: string[] = [];
  const obj = data as Record<string, unknown>;

  if (typeof obj.name === "string") parts.push(obj.name);
  if (typeof obj.description === "string") parts.push(obj.description);
  if (typeof obj.articleBody === "string") parts.push(obj.articleBody);
  if (typeof obj.text === "string") parts.push(obj.text);

  // Handle FAQ structured data
  if (obj["@type"] === "FAQPage" && Array.isArray(obj.mainEntity)) {
    for (const item of obj.mainEntity) {
      if (item && typeof item === "object") {
        const q = (item as Record<string, unknown>).name;
        const a = (item as Record<string, { text?: string }>).acceptedAnswer?.text;
        if (typeof q === "string" && typeof a === "string") {
          parts.push(`Q: ${q}\nA: ${a}`);
        }
      }
    }
  }

  return parts.join("\n");
}
