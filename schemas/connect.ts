import { z } from "zod";
import { CaseStatus, VetLabType } from "@prisma/client";

export const createFarmerCaseSchema = z.object({
  batchId: z.string().min(1, "Batch is required"),
  symptomsDescription: z
    .string()
    .min(5, "Please describe what is happening with the flock in at least 5 characters")
    .max(1000, "Description must be under 1000 characters"),
  selectedSymptoms: z.array(z.string()).default([]),
  assignedVetLabId: z.string().optional(),
});

export type CreateFarmerCaseInput = z.infer<typeof createFarmerCaseSchema>;

export const sendCaseSummarySchema = z.object({
  caseId: z.string().min(1, "Case ID is required"),
  vetLabId: z.string().min(1, "Recipient Vet/Lab ID is required"),
  consentGiven: z.literal(true, {
    errorMap: () => ({
      message: "Explicit farmer consent is required before sharing flock records with external specialists",
    }),
  }),
  preferredChannel: z.enum(["WHATSAPP", "SMS"]).default("WHATSAPP"),
});

export type SendCaseSummaryInputSchema = z.infer<typeof sendCaseSummarySchema>;

export const updateCaseStatusSchema = z.object({
  caseId: z.string().min(1, "Case ID is required"),
  status: z.nativeEnum(CaseStatus, {
    errorMap: () => ({ message: "Invalid case status transition" }),
  }),
  notes: z.string().max(500).optional(),
});

export type UpdateCaseStatusInput = z.infer<typeof updateCaseStatusSchema>;

export const vetMatchingFilterSchema = z.object({
  batchId: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radiusKm: z.number().min(5).max(300).default(100),
  type: z.nativeEnum(VetLabType).optional(),
  teleconsultOnly: z.boolean().default(false),
  limit: z.number().int().min(1).max(20).default(5),
});

export type VetMatchingFilter = z.infer<typeof vetMatchingFilterSchema>;
