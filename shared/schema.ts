import { z } from "zod";

export const DEAL_STATUSES = ["draft", "sent", "viewed", "accepted"] as const;
export type DealStatus = (typeof DEAL_STATUSES)[number];

export const PROJECT_TYPES = ["mobile", "web", "motion", "branding", "uxui", "other"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  mobile: "Mobile app",
  web: "Website",
  motion: "Motion & animation",
  branding: "Branding",
  uxui: "UX / UI design",
  other: "Other",
};

// ---------- Input schemas (validated on the API) ----------

export const optionInputSchema = z.object({
  name: z.string().min(1, "Option name is required"),
  description: z.string().default(""),
  price_cents: z.number().int().min(0),
  weeks: z.number().int().min(0),
  kind: z.enum(["base", "addon"]),
  default_selected: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export const milestoneInputSchema = z.object({
  title: z.string().min(1, "Milestone title is required"),
  deliverables: z.array(z.string()).default([]),
  week_start: z.number().int().min(0),
  week_length: z.number().int().min(1),
  sort_order: z.number().int().default(0),
});

export const dealInputSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and dashes"),
  title: z.string().min(1, "Title is required"),
  client_name: z.string().min(1, "Client name is required"),
  client_company: z.string().default(""),
  intro: z.string().default(""),
  video_url: z
    .union([z.string().url("Video URL must be a valid URL"), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v ? v : null)),
  outcomes: z.array(z.string()).default([]),
  project_type: z.enum(PROJECT_TYPES).default("other"),
  valid_until: z
    .union([z.string().min(1), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v ? v : null)),
  accent_color: z
    .union([
      z.string().regex(/^#[0-9a-fA-F]{6}$/, "Accent must be a hex color like #E4572E"),
      z.literal(""),
      z.null(),
    ])
    .optional()
    .transform((v) => (v ? v : null)),
  currency: z.string().length(3, "Currency must be a 3-letter code").default("USD"),
  status: z.enum(DEAL_STATUSES).default("draft"),
  options: z.array(optionInputSchema).default([]),
  milestones: z.array(milestoneInputSchema).default([]),
});

export type DealInput = z.infer<typeof dealInputSchema>;

export const eventInputSchema = z.object({
  type: z.enum(["view", "section_view", "option_toggle", "accept"]),
  meta: z.record(z.unknown()).default({}),
});

export const commentInputSchema = z.object({
  author_name: z.string().min(1, "Name is required").max(80),
  body: z.string().min(1, "Message is required").max(2000),
});

export const acceptInputSchema = z.object({
  signature_data_url: z.string().startsWith("data:image/", "Signature must be an image data URL"),
  selected_options: z.array(z.string()).default([]),
});

// ---------- Row types (as returned by the API) ----------

export interface Option {
  id: string;
  deal_id: string;
  name: string;
  description: string;
  price_cents: number;
  weeks: number;
  kind: "base" | "addon";
  default_selected: boolean;
  sort_order: number;
}

export interface Milestone {
  id: string;
  deal_id: string;
  title: string;
  deliverables: string[];
  week_start: number;
  week_length: number;
  sort_order: number;
}

export interface Deal {
  id: string;
  slug: string;
  title: string;
  client_name: string;
  client_company: string;
  intro: string;
  video_url: string | null;
  outcomes: string[];
  project_type: ProjectType;
  valid_until: string | null;
  accent_color: string | null;
  currency: string;
  status: DealStatus;
  signature_data_url: string | null;
  accepted_at: string | null;
  created_at: string;
}

export interface DealSummary extends Deal {
  view_count: number;
  total_cents: number;
  last_event_at: string | null;
}

export interface Comment {
  id: string;
  deal_id: string;
  author_name: string;
  author_role: "client" | "owner";
  body: string;
  created_at: string;
}

export interface DealDetail extends Deal {
  options: Option[];
  milestones: Milestone[];
  comments: Comment[];
}

export interface EventRow {
  id: string;
  deal_id: string;
  type: "view" | "section_view" | "option_toggle" | "accept" | "comment";
  meta: Record<string, unknown>;
  created_at: string;
}

export interface DealAnalytics {
  deal: Deal;
  total_views: number;
  accept_count: number;
  toggle_counts: { name: string; count: number }[];
  events: EventRow[];
}

export interface AppConfig {
  configured: boolean;
  adminRequired: boolean;
}
