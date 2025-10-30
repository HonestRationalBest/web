import { z } from "zod";

export const LocationChildSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  altName: z.string().nullable().optional().transform(v => (v ? v : undefined)),
});

export const LocationBoundarySchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  altName: z.string().nullable().optional().transform(v => (v ? v : undefined)),
  children: z.array(LocationChildSchema).optional(),
});

export const LocationBoundaryListSchema = z.array(LocationBoundarySchema);
