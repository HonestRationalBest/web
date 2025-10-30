import { useQuery } from "@tanstack/react-query";
import { fetchPopularBoundaries, fetchAllBoundaries } from "../api";

export const usePopularBoundaries = () => {
  return useQuery({
    queryKey: ["location", "boundaries", "popular"],
    queryFn: fetchPopularBoundaries,
  });
};

export const useAllBoundaries = () => {
  return useQuery({
    queryKey: ["location", "boundaries", "all"],
    queryFn: fetchAllBoundaries,
  });
};

