import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractFileContent, fetchUrlContent, invalidateKnowledgeCache } from "@/lib/knowledge";

// GET /api/agents/[id]/knowledge - List knowledge base items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the agent belongs to the user
    const { data: agent } = await supabase
      .from("agents")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Fetch knowledge base items
    const { data: items, error } = await supabase
      .from("knowledge_bases")
      .select("*")
      .eq("agent_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching knowledge base:", error);
      return NextResponse.json(
        { error: "Failed to fetch knowledge base" },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: items || [] });
  } catch (error) {
    console.error("Error in GET /api/agents/[id]/knowledge:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/agents/[id]/knowledge - Upload knowledge base item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the agent belongs to the user
    const { data: agent } = await supabase
      .from("agents")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const contentType = request.headers.get("content-type") || "";

    // Handle file upload (multipart/form-data)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      // Validate file size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File too large. Maximum size is 50MB." },
          { status: 400 }
        );
      }

      // Validate file type
      const ext = file.name.split(".").pop()?.toLowerCase();
      const allowedTypes = ["pdf", "docx", "txt", "csv", "json", "jpg", "jpeg", "png", "webp", "bmp", "tiff", "tif"];
      if (!ext || !allowedTypes.includes(ext)) {
        return NextResponse.json(
          {
            error: `Unsupported file type. Allowed: ${allowedTypes.join(", ")}`,
          },
          { status: 400 }
        );
      }

      // Sanitize file name and extract content
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileName = `${id}/${Date.now()}-${safeName}`;
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // Try to upload file to Supabase Storage (non-blocking — content extraction is more important)
      let storagePath: string | null = null;
      try {
        const { error: uploadError } = await supabase.storage
          .from("knowledge-files")
          .upload(fileName, fileBuffer, {
            contentType: file.type,
            upsert: false,
          });

        if (!uploadError) {
          storagePath = fileName;
        } else {
          console.error("Storage upload error (non-fatal):", uploadError.message);
        }
      } catch (storageErr) {
        console.error("Storage upload failed (non-fatal):", storageErr);
      }

      // Extract text content from the file
      let extractedContent = "";
      try {
        extractedContent = await extractFileContent(fileBuffer, ext);
      } catch (extractErr) {
        console.error("Content extraction error:", extractErr);
      }

      const imageTypes = ["jpg", "jpeg", "png", "webp", "bmp", "tiff", "tif"];
      if (!extractedContent) {
        if (imageTypes.includes(ext)) {
          return NextResponse.json(
            { error: "Could not extract text from image. The image may be too small, blurry, or not contain readable text." },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: "Could not extract content from the file. The file may be image-based — try uploading the images directly for OCR extraction." },
          { status: 400 }
        );
      }

      // Create knowledge base entry
      const { data: item, error: insertError } = await supabase
        .from("knowledge_bases")
        .insert({
          agent_id: id,
          source_type: "file",
          file_path: storagePath,
          content: extractedContent,
          indexing_status: "indexed",
          metadata: {
            original_name: file.name,
            file_size: file.size,
            mime_type: file.type,
          },
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        return NextResponse.json(
          { error: "Failed to create knowledge base entry" },
          { status: 500 }
        );
      }

      invalidateKnowledgeCache(id);
      return NextResponse.json(item, { status: 201 });
    }

    // Handle JSON body (URLs, FAQs, text)
    const body = await request.json();

    if (!body.source_type) {
      return NextResponse.json(
        { error: "source_type is required" },
        { status: 400 }
      );
    }

    const insertData: Record<string, unknown> = {
      agent_id: id,
      source_type: body.source_type,
      indexing_status: "pending",
    };

    if (body.source_type === "url") {
      if (!body.source_url) {
        return NextResponse.json(
          { error: "source_url is required for URL type" },
          { status: 400 }
        );
      }

      // Validate URL - only allow http/https and block internal IPs
      try {
        const url = new URL(body.source_url);
        if (!["http:", "https:"].includes(url.protocol)) {
          return NextResponse.json(
            { error: "Only http and https URLs are allowed" },
            { status: 400 }
          );
        }
        const hostname = url.hostname.toLowerCase();
        // Check RFC 1918 172.16-31.x.x range precisely
        const isPrivate172 = hostname.startsWith("172.") && (() => {
          const second = parseInt(hostname.split(".")[1], 10);
          return second >= 16 && second <= 31;
        })();
        if (
          hostname === "localhost" ||
          hostname === "127.0.0.1" ||
          hostname === "0.0.0.0" ||
          hostname === "[::1]" ||
          hostname === "::1" ||
          hostname.startsWith("10.") ||
          isPrivate172 ||
          hostname.startsWith("192.168.") ||
          hostname.startsWith("169.254.") ||
          hostname.startsWith("fe80:")
        ) {
          return NextResponse.json(
            { error: "Internal/private URLs are not allowed" },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Invalid URL format" },
          { status: 400 }
        );
      }

      insertData.source_url = body.source_url;

      // Fetch and extract content from the URL
      try {
        const urlContent = await fetchUrlContent(body.source_url);
        if (urlContent && urlContent.trim().length > 50) {
          insertData.content = urlContent;
          insertData.indexing_status = "indexed";
          insertData.metadata = {
            content_length: urlContent.length,
            fetched_at: new Date().toISOString(),
          };
        } else {
          insertData.content = urlContent || null;
          insertData.indexing_status = "failed";
          insertData.metadata = {
            error: urlContent
              ? "Content too short — the site may be JavaScript-rendered or blocking bots."
              : "Could not fetch any content from this URL. The site may be down or blocking requests.",
            fetched_at: new Date().toISOString(),
          };
        }
      } catch (urlErr) {
        console.error("URL content fetch error:", urlErr);
        insertData.indexing_status = "failed";
        insertData.metadata = {
          error: urlErr instanceof Error ? urlErr.message : "Failed to fetch URL content",
          fetched_at: new Date().toISOString(),
        };
      }
    } else if (body.source_type === "faq" || body.source_type === "text") {
      if (!body.content) {
        return NextResponse.json(
          { error: "content is required" },
          { status: 400 }
        );
      }
      insertData.content = body.content;
      insertData.indexing_status = "indexed";
    }

    if (body.metadata) {
      insertData.metadata = body.metadata;
    }

    const { data: item, error: insertError } = await supabase
      .from("knowledge_bases")
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create knowledge base entry" },
        { status: 500 }
      );
    }

    invalidateKnowledgeCache(id);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/agents/[id]/knowledge:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[id]/knowledge?itemId=xxx - Delete a knowledge base item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "itemId query parameter is required" },
        { status: 400 }
      );
    }

    // Verify the agent belongs to the user
    const { data: agent } = await supabase
      .from("agents")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Get the knowledge base item
    const { data: item } = await supabase
      .from("knowledge_bases")
      .select("*")
      .eq("id", itemId)
      .eq("agent_id", id)
      .single();

    if (!item) {
      return NextResponse.json(
        { error: "Knowledge base item not found" },
        { status: 404 }
      );
    }

    // Delete the file from storage if it exists
    if (item.source_type === "file" && item.file_path) {
      await supabase.storage
        .from("knowledge-files")
        .remove([item.file_path]);
    }

    // Delete the knowledge base entry
    const { error } = await supabase
      .from("knowledge_bases")
      .delete()
      .eq("id", itemId)
      .eq("agent_id", id);

    if (error) {
      console.error("Error deleting knowledge base item:", error);
      return NextResponse.json(
        { error: "Failed to delete knowledge base item" },
        { status: 500 }
      );
    }

    invalidateKnowledgeCache(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/agents/[id]/knowledge:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/[id]/knowledge - Retry a failed URL knowledge base item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: "itemId is required" },
        { status: 400 }
      );
    }

    // Verify agent ownership
    const { data: agent } = await supabase
      .from("agents")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Get the knowledge base item
    const { data: item } = await supabase
      .from("knowledge_bases")
      .select("*")
      .eq("id", itemId)
      .eq("agent_id", id)
      .single();

    if (!item) {
      return NextResponse.json(
        { error: "Knowledge base item not found" },
        { status: 404 }
      );
    }

    if (item.source_type !== "url" || !item.source_url) {
      return NextResponse.json(
        { error: "Only URL items can be retried" },
        { status: 400 }
      );
    }

    // Set to processing
    await supabase
      .from("knowledge_bases")
      .update({ indexing_status: "processing" })
      .eq("id", itemId);

    // Re-fetch URL content
    try {
      const urlContent = await fetchUrlContent(item.source_url);
      if (urlContent && urlContent.trim().length > 50) {
        const { data: updated } = await supabase
          .from("knowledge_bases")
          .update({
            content: urlContent,
            indexing_status: "indexed",
            metadata: {
              content_length: urlContent.length,
              fetched_at: new Date().toISOString(),
              retried: true,
            },
          })
          .eq("id", itemId)
          .select()
          .single();

        return NextResponse.json(updated);
      } else {
        const { data: updated } = await supabase
          .from("knowledge_bases")
          .update({
            content: urlContent || null,
            indexing_status: "failed",
            metadata: {
              error: urlContent
                ? "Content too short — the site may be JavaScript-rendered or blocking bots."
                : "Could not fetch any content from this URL.",
              fetched_at: new Date().toISOString(),
              retried: true,
            },
          })
          .eq("id", itemId)
          .select()
          .single();

        return NextResponse.json(updated);
      }
    } catch (urlErr) {
      const { data: updated } = await supabase
        .from("knowledge_bases")
        .update({
          indexing_status: "failed",
          metadata: {
            error: urlErr instanceof Error ? urlErr.message : "Retry failed",
            fetched_at: new Date().toISOString(),
            retried: true,
          },
        })
        .eq("id", itemId)
        .select()
        .single();

      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error("Error in PATCH /api/agents/[id]/knowledge:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
