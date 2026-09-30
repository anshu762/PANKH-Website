import { z } from "zod";

export const EXPENSE_CATEGORIES = [
  "chicks",
  "feed-starter",
  "feed-grower",
  "feed-finisher",
  "medicine",
  "vaccine",
  "vet-fee",
  "lab-test",
  "utilities",
  "labour",
  "mortality-disposal",
  "other",
] as const;

export const REVENUE_CATEGORIES = [
  "sales-birds",
  "sales-eggs",
  "sales-manure",
  "sales-byproduct",
  "other",
] as const;

export const createTransactionSchema = z.object({
  batchId: z.string().min(1, "Batch ID is required"),
  type: z.enum(["EXPENSE", "REVENUE"]),
  category: z.string().min(1, "Category is required"),
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than ₹0"),
  quantity: z.number().positive("Quantity must be positive").optional().nullable(),
  unit: z.string().max(30, "Unit must be 30 characters or less").optional().nullable(),
  date: z.string().or(z.date()),
  note: z.string().max(500, "Notes cannot exceed 500 characters").optional().nullable(),
});

export const updateTransactionSchema = z.object({
  id: z.string().min(1, "Transaction ID is required"),
  amount: z.number().positive("Amount must be greater than ₹0").optional(),
  category: z.string().min(1, "Category cannot be empty").optional(),
  quantity: z.number().positive("Quantity must be positive").optional().nullable(),
  unit: z.string().max(30).optional().nullable(),
  date: z.string().or(z.date()).optional(),
  note: z.string().max(500).optional().nullable(),
});

export const deleteTransactionSchema = z.object({
  id: z.string().min(1, "Transaction ID is required"),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type DeleteTransactionInput = z.infer<typeof deleteTransactionSchema>;
