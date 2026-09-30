import { z } from "zod";

export const upsertVetLabSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["VET", "LAB", "ASSOCIATION"]),
  qualification: z.string().optional().nullable(),
  phone: z.string().min(8, "Valid phone number required"),
  whatsapp: z.string().optional().nullable(),
  address: z.string().min(3, "Address is required"),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  serviceRadiusKm: z.number().positive().optional().nullable(),
  specializations: z.array(z.string()).default([]),
  teleconsult: z.boolean().default(false),
  hours: z.string().optional().nullable(),
  verified: z.boolean().default(false),
});

export const updateAlertRuleSchema = z.object({
  ruleId: z.string().min(1, "Rule ID is required"),
  newValue: z.number({ invalid_type_error: "Threshold must be a valid number" }),
});

export const upsertKnowledgeSourceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  authority: z.string().min(2, "Authority is required"),
  topic: z.string().min(2, "Topic is required"),
  language: z.string().default("en"),
  version: z.string().default("1.0"),
  url: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  approved: z.boolean().default(false),
  chunks: z
    .array(
      z.object({
        id: z.string().optional(),
        content: z.string().min(10, "Chunk content must be at least 10 characters"),
        birdType: z.string().optional().nullable(),
        tags: z.array(z.string()).default([]),
      })
    )
    .optional(),
});

export const toggleApprovalSchema = z.object({
  id: z.string().min(1, "Source ID is required"),
  approved: z.boolean(),
});

export const addAlertNoteSchema = z.object({
  alertId: z.string().min(1, "Alert ID is required"),
  note: z.string().min(1, "Note cannot be empty").max(1000),
});

export const addFarmerNoteSchema = z.object({
  farmerId: z.string().min(1, "Farmer ID is required"),
  note: z.string().min(1, "Note cannot be empty").max(1000),
});

export const reviewAiMessageSchema = z.object({
  messageId: z.string().min(1, "Message ID is required"),
  status: z.enum(["REVIEWED", "FLAGGED_UNSAFE", "DISMISSED"]),
  notes: z.string().max(500).optional(),
});

export type UpsertVetLabInput = z.infer<typeof upsertVetLabSchema>;
export type UpdateAlertRuleInput = z.infer<typeof updateAlertRuleSchema>;
export type UpsertKnowledgeSourceInput = z.infer<typeof upsertKnowledgeSourceSchema>;
export type ToggleApprovalInput = z.infer<typeof toggleApprovalSchema>;
export type AddAlertNoteInput = z.infer<typeof addAlertNoteSchema>;
export type AddFarmerNoteInput = z.infer<typeof addFarmerNoteSchema>;
export type ReviewAiMessageInput = z.infer<typeof reviewAiMessageSchema>;
