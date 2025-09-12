import { assessments, type Assessment, type InsertAssessment } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessment(id: string): Promise<Assessment | undefined>;
  getAllAssessments(): Promise<Assessment[]>;
}

export class DatabaseStorage implements IStorage {
  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const [assessment] = await db
      .insert(assessments)
      .values(insertAssessment)
      .returning();
    return assessment;
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    const [assessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, id));
    return assessment || undefined;
  }

  async getAllAssessments(): Promise<Assessment[]> {
    return await db.select().from(assessments);
  }
}

export const storage = new DatabaseStorage();
