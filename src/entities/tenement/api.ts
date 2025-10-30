import { API_BASE_URL } from "@/shared/config/api";
import type { TenementSearchRequest, TenementSearchResponse, TenementHistogramResponse, TenementCountResponse } from "./types";
import { TenementSearchResponseSchema, TenementHistogramResponseSchema, TenementCountResponseSchema } from "./schema";

export async function searchTenements(request: TenementSearchRequest): Promise<TenementSearchResponse> {
  const response = await fetch(`${API_BASE_URL}/tenement/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to search tenements: ${response.statusText}`);
  }

  const data = await response.json();
  const result = TenementSearchResponseSchema.safeParse(data);
  
  if (!result.success) {
    console.warn('Schema validation errors:', result.error.issues);
    // Return the data anyway, but try to fix common issues
    return {
      ...data,
      res: (data.res || []).map((item: any) => ({
        ...item,
        media: item.media || [],
        user: item.user ? {
          ...item.user,
          firstName: item.user.firstName ?? null,
          lastName: item.user.lastName ?? null,
        } : undefined,
      })),
    } as TenementSearchResponse;
  }
  
  return result.data;
}

export async function fetchHistogram(filter: TenementSearchRequest["filter"]): Promise<TenementHistogramResponse> {
  const response = await fetch(`${API_BASE_URL}/tenement/search/histogram`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...filter }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch histogram: ${response.statusText}`);
  }

  const data = await response.json();
  return TenementHistogramResponseSchema.parse(data);
}

export async function fetchTenementCount(filter: TenementSearchRequest["filter"]): Promise<TenementCountResponse> {
  const response = await fetch(`${API_BASE_URL}/tenement/search/count`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...filter }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tenement count: ${response.statusText}`);
  }

  const data = await response.json();
  return TenementCountResponseSchema.parse(data);
}

