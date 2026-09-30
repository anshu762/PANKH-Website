import { z } from "zod";

export const sentinelCheckinSchema = z.object({
  mortality: z
    .number({ invalid_type_error: "Mortality must be a number" })
    .int("Mortality must be a whole number")
    .min(0, "Mortality cannot be negative")
    .max(100000, "Mortality count exceeds realistic flock boundaries"),
  feedKg: z
    .number({ invalid_type_error: "Feed must be a number" })
    .min(0, "Feed cannot be negative")
    .max(50000, "Feed exceeds reasonable daily capacity")
    .nullable()
    .optional(),
  feedUnit: z.enum(["KG", "BAGS"]).default("KG").optional(),
  waterLitres: z
    .number({ invalid_type_error: "Water must be a number" })
    .min(0, "Water cannot be negative")
    .max(100000, "Water intake exceeds shed capacity")
    .nullable()
    .optional(),
  waterUnknown: z.boolean().default(false).optional(),
  eggCount: z
    .number({ invalid_type_error: "Egg production must be a number" })
    .int("Egg count must be a whole number")
    .min(0, "Egg count cannot be negative")
    .max(100000, "Egg count exceeds flock size")
    .nullable()
    .optional(),
  symptoms: z.array(z.string()).default([]),
  shedTemp: z
    .number({ invalid_type_error: "Temperature must be a number" })
    .min(5, "Temperature too low for poultry shed")
    .max(60, "Temperature exceeds shed thermal limit")
    .nullable()
    .optional(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").nullable().optional(),
  mediaUrl: z.string().url("Invalid media URL").nullable().optional(),
});

export type SentinelCheckinInputSchema = z.infer<typeof sentinelCheckinSchema>;

export const farmerActionSchema = z.object({
  alertId: z.string().min(1, "Alert ID is required"),
  action: z.enum(["RESOLVED", "STILL_HAPPENING", "VET_CONTACTED"]),
  notes: z.string().max(500).optional(),
});

export type FarmerActionInputSchema = z.infer<typeof farmerActionSchema>;
