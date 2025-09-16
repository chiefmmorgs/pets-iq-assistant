import { z } from "zod";

export const predictSchema = z.object({
  text: z.string().min(3),
  species: z.string().optional(),
  age: z.union([z.number(), z.string()]).optional()
});

export function parseBody(schema, body) {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => i.message).join(", ");
    const err = new Error(msg);
    err.status = 400;
    throw err;
  }
  return parsed.data;
}