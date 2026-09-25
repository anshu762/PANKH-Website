import { z } from "zod";

export const farmStepSchema = z.object({
  farmName: z.string().min(2, "Farm name must be at least 2 characters"),
  location: z.string().min(2, "Location or village name is required"),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  farmType: z.string().min(1, "Please select a farm structure type"),
  capacity: z.coerce
    .number()
    .int("Capacity must be a whole number")
    .min(100, "Capacity must be at least 100 birds")
    .max(500000, "Capacity cannot exceed 500,000 birds"),
  shedCount: z.coerce
    .number()
    .int("Shed count must be an integer")
    .min(1, "At least 1 shed is required")
    .max(50, "Shed count cannot exceed 50"),
  ventilationType: z.string().min(1, "Please select ventilation type"),
});

export type FarmStepInput = z.infer<typeof farmStepSchema>;

export const batchStepSchema = z.object({
  birdType: z.string().min(2, "Please specify or select bird type"),
  breed: z.string().min(2, "Please specify or select breed"),
  productionType: z.enum(["BROILER", "LAYER"], {
    errorMap: () => ({ message: "Please select Broiler or Layer" }),
  }),
  placementDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date in YYYY-MM-DD format"),
  startingBirds: z.coerce
    .number()
    .int("Bird count must be a whole number")
    .min(10, "Minimum 10 birds required for a flock batch")
    .max(200000, "Starting birds cannot exceed 200,000"),
});

export type BatchStepInput = z.infer<typeof batchStepSchema>;

export const onboardingSchema = farmStepSchema.and(batchStepSchema);

export type OnboardingInput = z.infer<typeof onboardingSchema>;
