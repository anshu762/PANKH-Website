import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number")
    .optional()
    .or(z.literal("")),
  role: z.enum(["FARMER", "VET", "ADMIN", "SUPER_ADMIN"]).default("FARMER"),
  preferredLanguage: z
    .enum(["PUNJABI", "HINDI", "ENGLISH"])
    .default("PUNJABI"),
  village: z.string().min(2, "Village name is required"),
  district: z.string().min(2, "District is required"),
  state: z.string().min(2, "State is required").default("Punjab"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
