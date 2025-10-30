import { useQuery } from "@tanstack/react-query";
import { searchTenements, fetchHistogram, fetchTenementCount } from "../api";
import type { TenementSearchRequest, TenementSearchFilter } from "../types";

export const useTenementSearch = (request: TenementSearchRequest) => {
  return useQuery({
    queryKey: ["tenement", "search", request],
    queryFn: () => searchTenements(request),
  });
};

export const useTenementHistogram = (filter: TenementSearchFilter) => {
  return useQuery({
    queryKey: ["tenement", "histogram", filter],
    queryFn: () => fetchHistogram(filter),
  });
};

export const useTenementCount = (filter: TenementSearchFilter) => {
  return useQuery({
    queryKey: ["tenement", "count", filter],
    queryFn: () => fetchTenementCount(filter),
  });
};

