import { type Assessment, type InsertAssessment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessment(id: string): Promise<Assessment | undefined>;
  getAllAssessments(): Promise<Assessment[]>;
}

export class MemStorage implements IStorage {
  private assessments: Map<string, Assessment>;

  constructor() {
    this.assessments = new Map();
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = randomUUID();
    const assessment: Assessment = { 
      ...insertAssessment, 
      id,
      createdAt: new Date()
    };
    this.assessments.set(id, assessment);
    return assessment;
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    return this.assessments.get(id);
  }

  async getAllAssessments(): Promise<Assessment[]> {
    return Array.from(this.assessments.values());
  }
}

export const storage = new MemStorage();
