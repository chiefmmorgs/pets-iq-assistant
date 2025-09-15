import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  petType: text("pet_type").notNull(),
  petAge: text("pet_age").notNull(),
  symptoms: text("symptoms").notNull(),
  triage: text("triage").notNull(),
  advice: jsonb("advice").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// VetDataHub Integration Tables
export const breedCharacteristics = pgTable("breed_characteristics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  species: text("species").notNull(), // dog, cat, etc.
  breed: text("breed").notNull(),
  size: text("size"), // small, medium, large
  intelligence: integer("intelligence"), // 1-5 scale
  lifespan: text("lifespan"), // "12-15 years"
  commonConditions: jsonb("common_conditions"), // array of common health issues
  traits: jsonb("traits"), // behavioral and physical traits
  vetAdvice: text("vet_advice"), // breed-specific veterinary advice
  createdAt: timestamp("created_at").defaultNow(),
});

export const symptomPatterns = pgTable("symptom_patterns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  species: text("species").notNull(),
  symptom: text("symptom").notNull(),
  severity: text("severity").notNull(), // emergency, urgent, mild
  ageGroup: text("age_group"), // puppy, adult, senior
  breedSpecific: text("breed_specific"), // specific breed if applicable
  relatedConditions: jsonb("related_conditions"), // possible conditions
  triageAdvice: text("triage_advice").notNull(),
  vetRequired: boolean("vet_required").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vetKnowledgeBase = pgTable("vet_knowledge_base", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topic: text("topic").notNull(), // condition name, treatment, etc.
  category: text("category").notNull(), // pathology, pharmacology, etc.
  species: text("species").notNull(),
  content: jsonb("content").notNull(), // structured knowledge data
  source: text("source"), // VetDataHub source reference
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas and types
export const insertAssessmentSchema = createInsertSchema(assessments).pick({
  petType: true,
  petAge: true,
  symptoms: true,
  triage: true,
  advice: true,
});

export const insertBreedCharacteristicsSchema = createInsertSchema(breedCharacteristics).omit({
  id: true,
  createdAt: true,
});

export const insertSymptomPatternsSchema = createInsertSchema(symptomPatterns).omit({
  id: true,
  createdAt: true,
});

export const insertVetKnowledgeBaseSchema = createInsertSchema(vetKnowledgeBase).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

// Types
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;

export type InsertBreedCharacteristics = z.infer<typeof insertBreedCharacteristicsSchema>;
export type BreedCharacteristics = typeof breedCharacteristics.$inferSelect;

export type InsertSymptomPatterns = z.infer<typeof insertSymptomPatternsSchema>;
export type SymptomPatterns = typeof symptomPatterns.$inferSelect;

export type InsertVetKnowledgeBase = z.infer<typeof insertVetKnowledgeBaseSchema>;
export type VetKnowledgeBase = typeof vetKnowledgeBase.$inferSelect;

// Triage response schema
export const triageResponseSchema = z.object({
  triage: z.enum(["emergency", "see_vet_soon", "ok"]),
  summary: z.string(),
  advice: z.array(z.string()),
  when_to_see_vet: z.string(),
  disclaimer: z.string(),
});

export type TriageResponse = z.infer<typeof triageResponseSchema>;

// Pet assessment request schema
export const petAssessmentSchema = z.object({
  petType: z.string().min(1),
  petAge: z.string().min(1),
  symptoms: z.string().min(1),
});

export type PetAssessmentRequest = z.infer<typeof petAssessmentSchema>;
