import { getJson } from "@/shared/lib/http";
import type { LocationBoundary } from "./types";
import { LocationBoundaryListSchema } from "./schema";

export async function fetchPopularBoundaries(): Promise<LocationBoundary[]> {
  const data = await getJson<unknown>("/geo/boundary/popular");
  return LocationBoundaryListSchema.parse(data ?? []);
}

export async function fetchAllBoundaries(): Promise<LocationBoundary[]> {
  const data = await getJson<unknown>("/geo/boundary");
  return LocationBoundaryListSchema.parse(data ?? []);
}
