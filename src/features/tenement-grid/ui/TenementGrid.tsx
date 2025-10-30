"use client";

import { useTenementStore, useTenementSearch, useTenementCount } from "@/entities/tenement";
import { useFiltersStore } from "@/entities/filters";
import { usePopularBoundaries, useAllBoundaries } from "@/entities/location";
import { TenementCard } from "@/shared/ui/tenement-card/TenementCard";
import { Pagination } from "@/shared/ui/pagination";
import { useMemo } from "react";
import styles from "./TenementGrid.module.scss";

export function TenementGrid() {
  const { currentRequest, setPage } = useTenementStore();
  const { withinId } = useFiltersStore();
  const { data: boundaries } = usePopularBoundaries();
  const { data: allBoundaries } = useAllBoundaries();

  const { data: searchData, isLoading: searchLoading, error: searchError } = useTenementSearch(
    currentRequest || {
      filter: { type: [2], rentType: ["rent"], showPriceOnRequest: true, sort: "most_recent" },
      paging: { pageSize: 26, page: 1 },
    }
  );

  const { data: countData, isLoading: countLoading } = useTenementCount(
    currentRequest?.filter || { type: [2], rentType: ["rent"], showPriceOnRequest: true, sort: "most_recent" }
  );

  const tenements = searchData?.res || [];
  const total = countData?.count || 0;
  const currentPage = currentRequest?.paging.page || 1;
  const pageSize = currentRequest?.paging.pageSize || 26;
  const loading = searchLoading || countLoading;
  const error = searchError ? String(searchError) : null;

  const locationName = useMemo(() => {
    const activeIds: string[] = withinId;
    if (activeIds.length > 0 && (boundaries || allBoundaries)) {
      const allLocations = [...(boundaries || []), ...(allBoundaries || [])];
      
      const matchedLocationMap = new Map<string, string>();
      
      allLocations.forEach(loc => {
        const locationName = loc.altName || loc.name;
        const isCitySelected = activeIds.includes(loc.id);
        const hasDistrictsSelected = loc.children?.some(child => activeIds.includes(child.id)) || false;
        
        if (isCitySelected || hasDistrictsSelected) {
          if (!matchedLocationMap.has(locationName.toLowerCase())) {
            matchedLocationMap.set(locationName.toLowerCase(), locationName);
          }
        }
      });

      if (matchedLocationMap.size > 0) {
        const uniqueNames = Array.from(matchedLocationMap.values());
        if (uniqueNames.length === 1) return uniqueNames[0];
        if (uniqueNames.length <= 3) return uniqueNames.join(", ");
        return `${uniqueNames.slice(0, 2).join(", ")} and ${uniqueNames.length - 2} more`;
      }
    }
    return null;
  }, [withinId, boundaries, allBoundaries, tenements]);

  if (loading) {
    return (
      <div className={styles.message}>
        <p>Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (tenements.length === 0) {
    return (
      <div className={styles.message}>
        <p>No properties found. Try adjusting your search filters.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {total} Listing{total !== 1 ? 's' : ''}
          {locationName ? ` in ${locationName}` : ''}
        </h2>
      </div>
      <div className={styles.grid}>
        {tenements.map((tenement) => (
          <TenementCard key={tenement.id} tenement={tenement} />
        ))}
      </div>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

