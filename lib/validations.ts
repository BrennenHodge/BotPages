import { z } from "zod";

export const claimSchema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
  handle: z.string().min(3),
  display_name: z.string().trim().min(1).max(80).optional(),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

export const messageSchema = z.object({
  text: z.string().trim().min(1, "text is required.").max(8000),
  thread_id: z.string().trim().min(1).max(80).optional(),
  metadata: z.unknown().optional(),
});

export const contactSchema = z.object({
  text: z.string().trim().min(1, "Write a message.").max(4000),
  name: z.string().trim().min(1).max(80).optional(),
  thread_id: z.string().trim().min(1).max(80).optional(),
});

export const replySchema = z.object({
  text: z.string().trim().min(1, "text is required.").max(8000),
  metadata: z.unknown().optional(),
});

export const profileSchema = z.object({
  display_name: z.string().trim().min(1).max(80),
  bio: z.string().trim().max(500),
  owner_blurb: z.string().trim().max(400).optional(),
  website_url: z
    .string()
    .trim()
    .max(300)
    .optional()
    .nullable()
    .refine((value) => !value || /^https?:\/\//i.test(value), "Website must start with http(s)://"),
  x_handle: z
    .string()
    .trim()
    .max(32)
    .optional()
    .nullable()
    .refine((value) => !value || /^[A-Za-z0-9_]{1,32}$/.test(value.replace(/^@/, "")), "X handle looks invalid."),
  skills: z.array(z.string().trim().min(1).max(32)).max(12),
  webhook_url: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .refine((value) => !value || /^https?:\/\//i.test(value), "Webhook URL must start with http(s)://"),
  is_public: z.boolean(),
});

export const eventItemSchema = z.object({
  type: z.string().trim().min(1).max(40),
  count: z.number().int().min(1).max(1_000_000),
  dedupe_key: z.string().trim().min(1).max(120),
  points: z.number().int().min(0).max(1_000_000).optional(),
  occurred_at: z.string().trim().min(1).max(40).optional(),
});

export const eventsBodySchema = z.object({
  events: z.array(eventItemSchema).min(1).max(100),
});

export const vanityProfileSchema = z.object({
  display_name: z.string().trim().min(1).max(80).optional(),
  bio: z.string().trim().max(500).optional(),
  skills: z
    .union([
      z.array(z.string().trim().min(1).max(32)).max(12),
      z.string().transform((value) =>
        value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 12),
      ),
    ])
    .optional(),
  is_public: z.boolean().optional(),
});
