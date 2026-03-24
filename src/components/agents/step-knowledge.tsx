"use client";

import { useState, useRef, useCallback } from "react";
import { useAgentBuilderStore } from "@/stores/agent-builder-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileText,
  Link as LinkIcon,
  HelpCircle,
  BookOpen,
  X,
  Plus,
  File,
  Pencil,
  Trash2,
} from "lucide-react";

const ACCEPTED_FILE_TYPES = [
  ".pdf",
  ".docx",
  ".txt",
  ".csv",
  ".json",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".bmp",
  ".tiff",
  ".tif",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StepKnowledge() {
  const {
    knowledgeFiles,
    knowledgeUrls,
    faqs,
    customInstructions,
    updateField,
  } = useAgentBuilderStore();

  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqError, setFaqError] = useState("");
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File handling
  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;

      const newFiles: File[] = [];
      const errors: string[] = [];

      Array.from(fileList).forEach((file) => {
        const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
        if (!ACCEPTED_FILE_TYPES.includes(ext)) {
          errors.push(`${file.name}: Unsupported file type`);
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          errors.push(
            `${file.name}: File too large (max ${formatFileSize(MAX_FILE_SIZE)})`
          );
          return;
        }
        newFiles.push(file);
      });

      if (errors.length > 0) {
        console.warn("File validation errors:", errors);
      }

      if (newFiles.length > 0) {
        updateField("knowledgeFiles", [...knowledgeFiles, ...newFiles]);
      }
    },
    [knowledgeFiles, updateField]
  );

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
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeFile = (index: number) => {
    const updated = knowledgeFiles.filter((_, i) => i !== index);
    updateField("knowledgeFiles", updated);
  };

  // URL handling
  const addUrl = () => {
    setUrlError("");
    try {
      new URL(urlInput);
    } catch {
      setUrlError("Please enter a valid URL");
      return;
    }

    if (knowledgeUrls.includes(urlInput)) {
      setUrlError("This URL has already been added");
      return;
    }

    updateField("knowledgeUrls", [...knowledgeUrls, urlInput]);
    setUrlInput("");
  };

  const removeUrl = (index: number) => {
    const updated = knowledgeUrls.filter((_, i) => i !== index);
    updateField("knowledgeUrls", updated);
  };

  // FAQ handling
  const addOrUpdateFaq = () => {
    setFaqError("");

    if (faqQuestion.trim().length < 5) {
      setFaqError("Question must be at least 5 characters");
      return;
    }
    if (faqAnswer.trim().length < 5) {
      setFaqError("Answer must be at least 5 characters");
      return;
    }

    const newFaq = {
      question: faqQuestion.trim(),
      answer: faqAnswer.trim(),
    };

    if (editingFaqIndex !== null) {
      const updated = [...faqs];
      updated[editingFaqIndex] = newFaq;
      updateField("faqs", updated);
      setEditingFaqIndex(null);
    } else {
      updateField("faqs", [...faqs, newFaq]);
    }

    setFaqQuestion("");
    setFaqAnswer("");
  };

  const editFaq = (index: number) => {
    setFaqQuestion(faqs[index].question);
    setFaqAnswer(faqs[index].answer);
    setEditingFaqIndex(index);
  };

  const removeFaq = (index: number) => {
    const updated = faqs.filter((_, i) => i !== index);
    updateField("faqs", updated);
    if (editingFaqIndex === index) {
      setEditingFaqIndex(null);
      setFaqQuestion("");
      setFaqAnswer("");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-1">Knowledge Base</h2>
        <p className="text-sm text-muted-foreground">
          Add documents, URLs, FAQs, and instructions to give your agent
          domain-specific knowledge
        </p>
      </div>

      <Tabs defaultValue="files" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="files" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Files</span>
            {knowledgeFiles.length > 0 && (
              <span className="ml-1 text-xs bg-primary/20 text-primary rounded-full px-1.5">
                {knowledgeFiles.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="urls" className="gap-1.5">
            <LinkIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">URLs</span>
            {knowledgeUrls.length > 0 && (
              <span className="ml-1 text-xs bg-primary/20 text-primary rounded-full px-1.5">
                {knowledgeUrls.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="faqs" className="gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">FAQs</span>
            {faqs.length > 0 && (
              <span className="ml-1 text-xs bg-primary/20 text-primary rounded-full px-1.5">
                {faqs.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="instructions" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Instructions</span>
          </TabsTrigger>
        </TabsList>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-4">
          {/* Drag and Drop Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
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
              accept={ACCEPTED_FILE_TYPES.join(",")}
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, DOCX, TXT, CSV, JSON, JPG, PNG, WEBP, BMP, TIFF up to 50MB
            </p>
          </div>

          {/* File List */}
          {knowledgeFiles.length > 0 && (
            <div className="space-y-2">
              {knowledgeFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <File className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
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
                    addUrl();
                  }
                }}
              />
              {urlError && (
                <p className="text-xs text-destructive mt-1">{urlError}</p>
              )}
            </div>
            <Button type="button" onClick={addUrl}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {knowledgeUrls.length > 0 && (
            <div className="space-y-2">
              {knowledgeUrls.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-sm truncate">{url}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => removeUrl(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {knowledgeUrls.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No URLs added yet. Add URLs to web pages, documentation, or APIs
              that your agent should reference.
            </p>
          )}
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="faq-question">Question</Label>
                <Textarea
                  id="faq-question"
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
                <Label htmlFor="faq-answer">Answer</Label>
                <Textarea
                  id="faq-answer"
                  placeholder="Our return policy allows returns within 30 days of purchase..."
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
              <Button type="button" onClick={addOrUpdateFaq}>
                <Plus className="h-4 w-4 mr-1" />
                {editingFaqIndex !== null ? "Update FAQ" : "Add FAQ"}
              </Button>
              {editingFaqIndex !== null && (
                <Button
                  type="button"
                  variant="ghost"
                  className="ml-2"
                  onClick={() => {
                    setEditingFaqIndex(null);
                    setFaqQuestion("");
                    setFaqAnswer("");
                  }}
                >
                  Cancel
                </Button>
              )}
            </CardContent>
          </Card>

          {faqs.length > 0 && (
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{faq.question}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {faq.answer}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => editFaq(index)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeFaq(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {faqs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No FAQs added yet. Add question-answer pairs that your agent
              should know.
            </p>
          )}
        </TabsContent>

        {/* Instructions Tab */}
        <TabsContent value="instructions" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-instructions">Custom Instructions</Label>
            <Textarea
              id="custom-instructions"
              placeholder={`Enter custom behavioral rules and instructions for your agent...

Examples:
- Always ask for the customer's order number before looking up orders
- Never share pricing information without first verifying the caller
- If the caller mentions an emergency, immediately transfer to a human agent
- Always end calls by asking if there's anything else you can help with`}
              value={customInstructions}
              onChange={(e) =>
                updateField("customInstructions", e.target.value)
              }
              rows={15}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              These instructions will be added to your agent&apos;s system
              prompt to guide its behavior during conversations.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
