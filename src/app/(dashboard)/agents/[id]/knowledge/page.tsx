"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Upload,
  FileText,
  Link as LinkIcon,
  HelpCircle,
  Plus,
  Trash2,
  File,
  Loader2,
  RefreshCw,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { KnowledgeBase } from "@/types";

const ACCEPTED_FILE_TYPES = ".pdf,.docx,.txt,.csv,.json,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.tif";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: "Pending",
    variant: "secondary" as const,
  },
  processing: {
    icon: Loader2,
    label: "Processing",
    variant: "warning" as const,
  },
  indexed: {
    icon: CheckCircle2,
    label: "Indexed",
    variant: "success" as const,
  },
  failed: {
    icon: AlertCircle,
    label: "Failed",
    variant: "destructive" as const,
  },
};

export default function KnowledgeBasePage() {
  const params = useParams();
  const agentId = params.id as string;

  const [items, setItems] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqError, setFaqError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch(`/api/agents/${agentId}/knowledge`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch knowledge base:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // File Upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE) {
          console.error(`${file.name} is too large (max 50MB)`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("source_type", "file");

        const res = await fetch(`/api/agents/${agentId}/knowledge`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          console.error(`Failed to upload ${file.name}`);
        }
      }
      await fetchItems();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFileUpload(e.dataTransfer.files);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agentId]
  );

  // URL Add
  const [addingUrl, setAddingUrl] = useState(false);
  const handleAddUrl = async () => {
    setUrlError("");
    try {
      new URL(urlInput);
    } catch {
      setUrlError("Please enter a valid URL");
      return;
    }

    setAddingUrl(true);
    try {
      const res = await fetch(`/api/agents/${agentId}/knowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_type: "url",
          source_url: urlInput,
        }),
      });
      if (res.ok) {
        setUrlInput("");
        await fetchItems();
      } else {
        const data = await res.json();
        setUrlError(data.error || "Failed to add URL");
      }
    } catch (error) {
      console.error("Failed to add URL:", error);
      setUrlError("Network error. Please try again.");
    } finally {
      setAddingUrl(false);
    }
  };

  // FAQ Add
  const handleAddFaq = async () => {
    setFaqError("");
    if (faqQuestion.trim().length < 5) {
      setFaqError("Question must be at least 5 characters");
      return;
    }
    if (faqAnswer.trim().length < 5) {
      setFaqError("Answer must be at least 5 characters");
      return;
    }

    try {
      const res = await fetch(`/api/agents/${agentId}/knowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_type: "faq",
          content: JSON.stringify({
            question: faqQuestion.trim(),
            answer: faqAnswer.trim(),
          }),
        }),
      });
      if (res.ok) {
        setFaqQuestion("");
        setFaqAnswer("");
        await fetchItems();
      }
    } catch (error) {
      console.error("Failed to add FAQ:", error);
    }
  };

  // Delete item
  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/agents/${agentId}/knowledge?itemId=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // Retry failed URL
  const handleRetryUrl = async (itemId: string) => {
    setRetryingId(itemId);
    try {
      const res = await fetch(`/api/agents/${agentId}/knowledge`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? updated : item))
        );
      }
    } catch (error) {
      console.error("Retry failed:", error);
    } finally {
      setRetryingId(null);
    }
  };

  // Filter items by type
  const fileItems = items.filter((i) => i.source_type === "file");
  const urlItems = items.filter((i) => i.source_type === "url");
  const faqItems = items.filter((i) => i.source_type === "faq");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/agents/${agentId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Knowledge Base</h1>
            <p className="text-sm text-muted-foreground">
              Manage documents, URLs, and FAQs for your agent
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchItems(true)} disabled={refreshing}>
          <RefreshCw className={cn("h-4 w-4 mr-1", refreshing && "animate-spin")} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{fileItems.length}</p>
              <p className="text-xs text-muted-foreground">Files</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <LinkIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{urlItems.length}</p>
              <p className="text-xs text-muted-foreground">URLs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{faqItems.length}</p>
              <p className="text-xs text-muted-foreground">FAQs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="files" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="urls">URLs</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
        </TabsList>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-4">
          {/* Upload area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept={ACCEPTED_FILE_TYPES}
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            {uploading ? (
              <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin mb-3" />
            ) : (
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            )}
            <p className="text-sm font-medium">
              {uploading
                ? "Uploading..."
                : "Drag and drop files here, or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, DOCX, TXT, CSV, JSON, JPG, PNG, WEBP, BMP, TIFF up to 50MB
            </p>
          </div>

          {/* File list */}
          {fileItems.length > 0 ? (
            <div className="space-y-2">
              {fileItems.map((item) => {
                const status = STATUS_CONFIG[item.indexing_status];
                const StatusIcon = status.icon;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <File className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {(item.metadata as Record<string, string>)?.original_name || item.file_path?.split("/").pop() || "Unknown file"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Added{" "}
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant} className="gap-1">
                        <StatusIcon
                          className={cn(
                            "h-3 w-3",
                            item.indexing_status === "processing" &&
                              "animate-spin"
                          )}
                        />
                        {status.label}
                      </Badge>
                      <Dialog
                        open={deleteId === item.id}
                        onOpenChange={(open) =>
                          setDeleteId(open ? item.id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete File</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to remove this file from the
                              knowledge base? This cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setDeleteId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(item.id)}
                              disabled={deleting}
                            >
                              {deleting ? "Deleting..." : "Delete"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No files uploaded yet. Upload documents to train your agent.
            </p>
          )}
        </TabsContent>

        {/* URLs Tab */}
        <TabsContent value="urls" className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="https://example.com/docs"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setUrlError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
              />
              {urlError && (
                <p className="text-xs text-destructive mt-1">{urlError}</p>
              )}
            </div>
            <Button onClick={handleAddUrl} disabled={addingUrl || !urlInput.trim()}>
              {addingUrl ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              {addingUrl ? "Fetching..." : "Add"}
            </Button>
          </div>

          {urlItems.length > 0 ? (
            <div className="space-y-2">
              {urlItems.map((item) => {
                const status = STATUS_CONFIG[item.indexing_status];
                const StatusIcon = status.icon;
                const metadata = item.metadata as Record<string, unknown> | null;
                const errorMsg = metadata?.error as string | undefined;
                const contentLength = metadata?.content_length as number | undefined;
                const isRetrying = retryingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      item.indexing_status === "failed" && "border-destructive/30 bg-destructive/5"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm truncate">
                            {item.source_url || "Unknown URL"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              Added{" "}
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                            {contentLength && (
                              <span>
                                {contentLength > 1000
                                  ? `${(contentLength / 1000).toFixed(1)}K chars`
                                  : `${contentLength} chars`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={status.variant} className="gap-1">
                          <StatusIcon
                            className={cn(
                              "h-3 w-3",
                              (item.indexing_status === "processing" || isRetrying) &&
                                "animate-spin"
                            )}
                          />
                          {isRetrying ? "Retrying..." : status.label}
                        </Badge>
                        {item.indexing_status === "failed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleRetryUrl(item.id)}
                            disabled={isRetrying}
                          >
                            <RefreshCw className={cn("h-3 w-3 mr-1", isRetrying && "animate-spin")} />
                            Retry
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    {item.indexing_status === "failed" && errorMsg && (
                      <p className="text-xs text-destructive/80 mt-2 ml-7">
                        {errorMsg}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No URLs added yet. Add web pages for your agent to learn from.
            </p>
          )}
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kb-faq-question">Question</Label>
                <Textarea
                  id="kb-faq-question"
                  placeholder="What is your return policy?"
                  value={faqQuestion}
                  onChange={(e) => {
                    setFaqQuestion(e.target.value);
                    setFaqError("");
                  }}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kb-faq-answer">Answer</Label>
                <Textarea
                  id="kb-faq-answer"
                  placeholder="We accept returns within 30 days of purchase..."
                  value={faqAnswer}
                  onChange={(e) => {
                    setFaqAnswer(e.target.value);
                    setFaqError("");
                  }}
                  rows={3}
                />
              </div>
              {faqError && (
                <p className="text-xs text-destructive">{faqError}</p>
              )}
              <Button onClick={handleAddFaq}>
                <Plus className="h-4 w-4 mr-1" />
                Add FAQ
              </Button>
            </CardContent>
          </Card>

          {faqItems.length > 0 ? (
            <div className="space-y-2">
              {faqItems.map((item) => {
                let faqData = { question: "", answer: "" };
                try {
                  faqData = JSON.parse(item.content || "{}");
                } catch {
                  faqData = {
                    question: item.content || "",
                    answer: "",
                  };
                }

                const status = STATUS_CONFIG[item.indexing_status];
                const StatusIcon = status.icon;

                return (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">
                            {faqData.question}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {faqData.answer}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={status.variant} className="gap-1">
                            <StatusIcon
                              className={cn(
                                "h-3 w-3",
                                item.indexing_status === "processing" &&
                                  "animate-spin"
                              )}
                            />
                            {status.label}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No FAQs added yet. Add question-answer pairs for your agent.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
