import { z } from "zod";

// Minimal schema - ready for your custom implementation
export const petAssessmentSchema = z.object({
  petType: z.string().min(1, "Pet type is required"),
  petAge: z.string().min(1, "Pet age is required"), 
  symptoms: z.string().min(10, "Please describe symptoms in at least 10 characters"),
});

// Types
export type PetAssessment = z.infer<typeof petAssessmentSchema>;
