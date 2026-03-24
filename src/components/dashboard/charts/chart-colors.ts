export const VONEX_COLORS = {
  primary: "#2E3192",
  orange: "#DE6C33",
  gold: "#F2A339",
  cyan: "#00A2C7",
} as const;

export const CHART_PALETTE = [
  "#2E3192",
  "#DE6C33",
  "#F2A339",
  "#00A2C7",
  "#22c55e",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
] as const;

export const STATUS_COLORS: Record<string, string> = {
  completed: "#22c55e",
  failed: "#ef4444",
  no_answer: "#f59e0b",
  busy: "#f97316",
  initiated: "#94a3b8",
  ringing: "#3b82f6",
  in_progress: "#3b82f6",
};

export const SENTIMENT_COLORS: Record<string, string> = {
  positive: "#22c55e",
  neutral: "#F2A339",
  negative: "#ef4444",
  mixed: "#8b5cf6",
};

export const LEAD_COLORS: Record<string, string> = {
  hot: "#ef4444",
  warm: "#f59e0b",
  cold: "#3b82f6",
};

export const ENGAGEMENT_COLORS: Record<string, string> = {
  high: "#22c55e",
  medium: "#f59e0b",
  low: "#94a3b8",
};
