import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
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

export const insertAssessmentSchema = createInsertSchema(assessments).pick({
  petType: true,
  petAge: true,
  symptoms: true,
  triage: true,
  advice: true,
});

export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;

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
