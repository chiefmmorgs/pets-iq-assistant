import { z } from "zod";

// Pet assessment schema for frontend
export const petAssessmentSchema = z.object({
  petType: z.string().min(1, "Pet type is required"),
  petAge: z.string().min(1, "Pet age is required"), 
  symptoms: z.string().min(10, "Please describe symptoms in at least 10 characters"),
});

// Backend API request schema
export const predictSchema = z.object({
  text: z.string().min(3),
  species: z.string().optional(),
  age: z.union([z.number(), z.string()]).optional()
});

// Enhanced API Response types with structured assessment data
export interface Signal {
  name: string;
  weight: number;
  present: boolean;
}

export interface Differential {
  name: string;
  why: string;
}

export interface StructuredAssessmentResponse {
  ok: boolean;
  category: string;
  disease: string;
  signals: Signal[];
  differentials: Differential[];
  triage: "emergency" | "urgent" | "home";
  red_flags: string[];
  actions: string[];
  confidence: number;
  assessment_method?: string;
  ml_prediction?: string;
  request_id?: string;
}

export interface EnhancedChatResponse extends StructuredAssessmentResponse {
  message: string;
}

// Legacy types for compatibility
export interface PredictResponse {
  ok: boolean;
  label: string;
  triage: "emergency" | "see_soon" | "general";
  scores: Array<{label: string; value: number}>;
}

export interface ChatResponse {
  ok: boolean;
  model_label: string;
  triage: "emergency" | "see_soon" | "general";
  message: string;
}

// Legacy types for compatibility
export interface TriageResponse {
  triage: "emergency" | "see_vet_soon" | "ok";
  summary: string;
  advice: string[];
  when_to_see_vet: string;
  disclaimer: string;
}

export type PetAssessment = z.infer<typeof petAssessmentSchema>;
export type PetAssessmentRequest = PetAssessment;
