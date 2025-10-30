import { useMemo } from "react";
import { usePopularBoundaries, useAllBoundaries } from "@/entities/location";

type SearchResult = {
  id: string;
  name: string;
  altName?: string;
  type: "state" | "city" | "district";
  hasChildren: boolean;
};

export const useLocationSearch = (searchValue: string) => {
  const { data: boundaries } = usePopularBoundaries();
  const { data: allBoundaries } = useAllBoundaries();

  const allLocations = useMemo(() => {
    if (!searchValue || searchValue.length === 0) return [];

    const locations: SearchResult[] = [];
    const added = new Set<string>();

    const addLocation = (loc: any, type: "state" | "city" | "district") => {
      if (added.has(loc.id)) return;

      const displayName = loc.altName || loc.name;
      if (displayName.toLowerCase().includes(searchValue.toLowerCase())) {
        locations.push({
          id: loc.id,
          name: displayName,
          altName: loc.altName,
          type,
          hasChildren: !!loc.children && loc.children.length > 0,
        });
        added.add(loc.id);
      }
    };

    boundaries?.forEach((loc) => addLocation(loc, "city"));

    allBoundaries?.forEach((loc) => {
      const type = loc.children && loc.children.length > 0 ? "state" : "city";
      addLocation(loc, type);

      loc.children?.forEach((child) => addLocation(child, "district"));
    });

    return locations;
  }, [boundaries, allBoundaries, searchValue]);

  return allLocations;
};

