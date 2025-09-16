declare module "../src/ml.js" {
  export type Classifier = {
    classify(text: string): string;
    getClassifications(text: string): Array<{label: string; value: number}>;
  };
  export function trainAndSave(path?: string): Promise<Classifier>;
  export function loadModel(): Promise<Classifier | null>;
  export function bucketAge(a: number | string): string;
}

declare module "../src/triageMap.js" {
  export const DISEASE_TRIAGE: Record<string, "emergency" | "see_soon" | "general">;
}

declare module "../src/openaiChat.js" {
  export function vetChat(
    apiKey: string | undefined,
    userText: string,
    species?: string,
    age?: number | string,
    predicted?: string,
    triage?: string
  ): Promise<string>;
}

declare module "../src/romaClient.js" {
  export function askRoma(input: string): Promise<any>;
}

declare module "../src/validators.js" {
  export const predictSchema: any;
  export function parseBody<T>(schema: any, body: unknown): T;
}