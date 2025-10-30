"use client";

import styles from "./Navbar.module.scss";
import { Toggle } from "@/shared/ui/toggle";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LocationFilter, MapSearchPopup, useLocationSearch } from "@/features/filter-location";
import { CategoryFilter } from "@/features/filter-category";
import { PriceFilter } from "@/features/filter-price";
import { useFiltersStore } from "@/entities/filters";
import { useTenementStore } from "@/entities/tenement";
import { usePopularBoundaries, useAllBoundaries } from "@/entities/location";
import type { TenementSearchRequest } from "@/entities/tenement";

export function Navbar() {
  const [open, setOpen] = useState<"location" | "category" | "price" | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [locationSearchValue, setLocationSearchValue] = useState("");
  const { withinId, type, rentType, rent, showPriceOnRequest, near, bbox, setRentType, setWithinId } = useFiltersStore();
  const { setRequest } = useTenementStore();
  const navbarRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  // Helpers to serialize/deserialize filters to URL
  const buildQueryFromFilters = (opts: {
    withinId?: string[];
    type?: number[];
    rentType?: ("rent" | "buy")[];
    rent?: [number, number] | undefined;
    showPriceOnRequest?: boolean;
    near?: { coordinates: [number, number]; radius?: number } | undefined;
    bbox?: [number, number, number, number] | undefined;
  }) => {
    const params = new URLSearchParams();
    if (opts.withinId && opts.withinId.length > 0) params.set("withinId", opts.withinId.join(","));
    if (opts.type && opts.type.length > 0) params.set("type", opts.type.join(","));
    if (opts.rentType && opts.rentType.length > 0) params.set("rentType", opts.rentType[0]);
    if (opts.rent && (opts.rent[0] !== null || opts.rent[1] !== null)) params.set("rent", `${opts.rent[0]}-${opts.rent[1]}`);
    if (typeof opts.showPriceOnRequest === "boolean") params.set("show", opts.showPriceOnRequest ? "1" : "0");
    if (opts.near) {
      const [lng, lat] = opts.near.coordinates;
      const radius = opts.near.radius ?? 5000;
      params.set("near", `${lng},${lat},${radius}`);
    }
    if (opts.bbox) {
      const [minX, minY, maxX, maxY] = opts.bbox;
      params.set("bbox", `${minX},${minY},${maxX},${maxY}`);
    }
    return params;
  };

  const parseFiltersFromQuery = () => {
    const q = new URLSearchParams(searchParams?.toString() || "");
    const nextWithinId = q.get("withinId")?.split(",").filter(Boolean) || [];
    const nextType = (q.get("type")?.split(",").map((n) => parseInt(n, 10)).filter((n) => !Number.isNaN(n)) || []) as number[];
    const nextRentType = (q.get("rentType") === "buy" || q.get("rentType") === "rent") ? (q.get("rentType") as "buy" | "rent") : undefined;
    const rentRaw = q.get("rent");
    const nextRent: [number, number] | undefined = rentRaw && rentRaw.includes("-")
      ? (rentRaw.split("-").map((n) => parseInt(n, 10)) as [number, number])
      : undefined;
    const showRaw = q.get("show");
    const nextShow = showRaw === "1" ? true : showRaw === "0" ? false : undefined;
    const nearRaw = q.get("near");
    let nextNear: { coordinates: [number, number]; radius?: number } | undefined = undefined;
    if (nearRaw) {
      const parts = nearRaw.split(",").map((n) => parseFloat(n));
      if (parts.length >= 2 && parts.every((n) => !Number.isNaN(n))) {
        nextNear = { coordinates: [parts[0], parts[1]], radius: parts[2] } as any;
      }
    }
    const bboxRaw = q.get("bbox");
    let nextBbox: [number, number, number, number] | undefined = undefined;
    if (bboxRaw) {
      const parts = bboxRaw.split(",").map((n) => parseFloat(n));
      if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
        nextBbox = [parts[0], parts[1], parts[2], parts[3]];
      }
    }

    return { nextWithinId, nextType, nextRentType, nextRent, nextShow, nextNear, nextBbox };
  };

  const locationSearchResults = useLocationSearch(locationSearchValue);
  const { data: boundaries } = usePopularBoundaries();
  const { data: allBoundaries } = useAllBoundaries();

  const selectedLocations = useMemo(() => {
    if (withinId.length === 0) return [];

    const allLocations = [...(boundaries || []), ...(allBoundaries || [])];
    const locationMap = new Map<string, { id: string; name: string }>();

    allLocations.forEach(loc => {
      if (withinId.includes(loc.id) && !locationMap.has(loc.id)) {
        locationMap.set(loc.id, { id: loc.id, name: loc.altName || loc.name });
      }
      if (loc.children) {
        loc.children.forEach(child => {
          if (withinId.includes(child.id) && !locationMap.has(child.id)) {
            locationMap.set(child.id, { id: child.id, name: child.altName || child.name });
          }
        });
      }
    });

    return withinId
      .map(id => locationMap.get(id))
      .filter((loc): loc is { id: string; name: string } => loc !== undefined);
  }, [withinId, boundaries, allBoundaries]);

  const handleClearLocation = (locationId: string) => {
    setWithinId([]);
  };

  const rentMode = rentType[0] || "rent";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setOpen(null);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  useEffect(() => {
    // On mount: read URL params and initialize filters + request
    const { nextWithinId, nextType, nextRentType, nextRent, nextShow, nextNear, nextBbox } = parseFiltersFromQuery();
    const setters = useFiltersStore.getState();
    if (nextWithinId.length > 0) setters.setWithinId(nextWithinId);
    if (nextType.length > 0) setters.setType(nextType);
    if (nextRentType) setters.setRentType(nextRentType);
    if (nextRent) setters.setRent(nextRent[0], nextRent[1]);
    if (typeof nextShow === "boolean") setters.setShowPriceOnRequest(nextShow);
    if (nextNear) setters.setNear(nextNear);
    if (nextBbox) setters.setBbox(nextBbox);

    const request: TenementSearchRequest = {
      filter: {
        withinId: (nextWithinId.length > 0 ? nextWithinId : withinId.length > 0 ? withinId : undefined),
        type: (nextType.length > 0 ? nextType : (type.length > 0 ? type : undefined)),
        rentType: (nextRentType ? [nextRentType] : rentType),
        rent: nextRent ? nextRent : (rent[0] !== null || rent[1] !== null ? rent : undefined),
        showPriceOnRequest: typeof nextShow === "boolean" ? nextShow : showPriceOnRequest,
        near: nextNear ?? near,
        bbox: nextBbox ?? bbox,
        sort: "most_recent"
      },
      paging: {
        pageSize: 26,
        page: 1,
      },
    };
    setRequest(request);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRentTypeChange = (value: "rent" | "buy") => {
    setRentType(value);
  };

  const handleFilterClick = (filter: "location" | "category" | "price") => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
    setOpen(open === filter ? null : filter);
  };

  const findLocationIdByName = (searchValue: string): string | null => {
    if (!searchValue || searchValue.trim().length === 0) return null;

    const allLocations = [...(boundaries || []), ...(allBoundaries || [])];
    const searchLower = searchValue.toLowerCase().trim();

    for (const loc of allLocations) {
      const displayName = (loc.altName || loc.name).toLowerCase();
      if (displayName === searchLower) {
        return loc.id;
      }

      if (loc.children) {
        for (const child of loc.children) {
          const childDisplayName = (child.altName || child.name).toLowerCase();
          if (childDisplayName === searchLower) {
            return child.id;
          }
        }
      }
    }

    for (const loc of allLocations) {
      const displayName = (loc.altName || loc.name).toLowerCase();
      if (displayName.includes(searchLower) || searchLower.includes(displayName)) {
        return loc.id;
      }

      if (loc.children) {
        for (const child of loc.children) {
          const childDisplayName = (child.altName || child.name).toLowerCase();
          if (childDisplayName.includes(searchLower) || searchLower.includes(childDisplayName)) {
            return child.id;
          }
        }
      }
    }

    return null;
  };

  const handleSearch = () => {
    let finalWithinId = withinId;

    if (locationSearchValue && locationSearchValue.trim().length > 0 && withinId.length === 0) {
      const foundLocationId = findLocationIdByName(locationSearchValue);
      if (foundLocationId) {
        finalWithinId = [foundLocationId];
        setWithinId(finalWithinId);
        setLocationSearchValue("");
      }
    }

    // If there is a draft selection, apply it now
    const { draftWithinId, applyDraft } = useFiltersStore.getState() as any;
    if (draftWithinId && draftWithinId.length > 0) {
      applyDraft();
      finalWithinId = draftWithinId;
    }

    const request: TenementSearchRequest = {
      filter: {
        withinId: finalWithinId.length > 0 ? finalWithinId : undefined,
        type: type.length > 0 ? type : undefined,
        rentType: rentType,
        rent: rent[0] !== null || rent[1] !== null ? rent : undefined,
        showPriceOnRequest: showPriceOnRequest,
        near: near,
        bbox: bbox,
        sort: "most_recent"
      },
      paging: {
        pageSize: 26,
        page: 1,
      },
    };

    setRequest(request);
    // Update URL with applied filters for shareable link
    const params = buildQueryFromFilters({
      withinId: request.filter.withinId,
      type: request.filter.type,
      rentType: request.filter.rentType as any,
      rent: request.filter.rent as any,
      showPriceOnRequest: request.filter.showPriceOnRequest,
      near: request.filter.near,
      bbox: request.filter.bbox,
    });
    router.replace(`?${params.toString()}`);
    setOpen(null);
  };

  const getCategoryLabel = () => {
    if (type.length === 0) return null;
    const categoryNames: Record<number, string> = {
      1: "Rooms/Co-Living",
      2: "Apartments",
      3: "Houses",
      4: "Plots",
      5: "Commercial",
      11: "Holiday Homes",
      12: "New Developments",
      13: "Parking",
      20: "Office",
    };
    return categoryNames[type[0]] || null;
  };

  const getPriceLabel = () => {
    if (rent[0] === 0 && rent[1] === 9999) return null;
    if (rent[0] > 0 && rent[1] < 9999) return `€${rent[0]} - €${rent[1]}`;
    if (rent[0] > 0) return `From €${rent[0]}`;
    if (rent[1] < 9999) return `Up to €${rent[1]}`;
    return null;
  };

  return (
    <header className={`${styles.root} ${isExpanded ? styles.expanded : ''}`} ref={navbarRef}>
      <div className={`${styles.mainNavbar} ${isExpanded ? styles.expanded : ''}`}>
        {isExpanded && (
          <div className={styles.toggleContainer}>
            <Toggle
              options={[
                { value: "rent", label: "Rent" },
                { value: "buy", label: "Buy" },
              ]}
              value={rentMode}
              onChange={handleRentTypeChange}
            />
          </div>
        )}

        <div className={`${styles.searchBar} ${isExpanded ? styles.searchBarExpanded : ''}`}>
          <div
            className={`${styles.section} ${styles.locationSection} ${!isExpanded ? styles.locationSectionExpanded : ''} ${open === "location" ? styles.active : ''}`}
          >
            {isExpanded && <div className={styles.label}>Location</div>}
            <div className={styles.locationContent}>
              {isExpanded && selectedLocations.length > 0 && (
                <div className={styles.locationTags}>
                  {(() => {
                    const first = selectedLocations[0];
                    const remaining = selectedLocations.length - 1;
                    return (
                      <>
                        <div key={first.id} className={styles.locationTag}>
                          <span className={styles.tagText}>{first.name} {remaining > 0 && `+${remaining}`}</span>
                          <button
                            className={styles.tagClose}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearLocation(first.id);
                            }}
                            aria-label={`Remove ${first.name}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <g opacity="0.6">
                                <path d="M8 1C4.1 1 1 4.1 1 8C1 11.9 4.1 15 8 15C11.9 15 15 11.9 15 8C15 4.1 11.9 1 8 1ZM10.7 11.5L8 8.8L5.3 11.5L4.5 10.7L7.2 8L4.5 5.3L5.3 4.5L8 7.2L10.7 4.5L11.5 5.3L8.8 8L11.5 10.7L10.7 11.5Z" fill="#A440F1" />
                              </g>
                            </svg>
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
              <input
                type="text"
                className={`${styles.value} ${!locationSearchValue && selectedLocations.length === 0 ? styles.placeholder : ''}`}
                placeholder={isExpanded ? "City District, Street, Postcode" : "Map Area"}
                value={locationSearchValue}
                onChange={(e) => setLocationSearchValue(e.target.value)}
                onFocus={() => {
                  if (!isExpanded) {
                    setIsExpanded(true);
                  }
                  setOpen("location");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                autoComplete="off"
              />
            </div>
            {open === "location" && locationSearchValue.length > 0 && locationSearchResults.length > 0 && (
              <div className={styles.popupWrapper}>
                <MapSearchPopup
                  searchValue={locationSearchValue}
                  results={locationSearchResults}
                  onClose={() => setOpen(null)}
                  onSelectLocation={(locationId, locationName) => {
                    const { setDraftWithinId } = useFiltersStore.getState() as any;
                    setDraftWithinId([locationId]);
                    setLocationSearchValue("");
                    setOpen(null);
                  }}
                />
              </div>
            )}
            {open === "location" && (locationSearchValue.length === 0 || locationSearchResults.length === 0) && (
              <LocationFilter
                onClose={() => setOpen(null)}
                searchValue={locationSearchValue}
                onSearchChange={setLocationSearchValue}
              />
            )}
          </div>

          <div
            className={`${styles.section} ${styles.categorySection} ${!isExpanded ? styles.categorySectionExpanded : ''} ${open === "category" ? styles.active : ''}`}
            onClick={() => handleFilterClick("category")}
          >
            {isExpanded && <div className={styles.label}>Category</div>}
            <div
              className={`${styles.value} ${!getCategoryLabel() ? styles.placeholder : ''}`}
            >
              {getCategoryLabel() || (isExpanded ? "All Categories" : "Apartments")}
            </div>
            {open === "category" && <CategoryFilter onClose={() => setOpen(null)} />}
          </div>

          <div className={`${styles.priceSection} ${!isExpanded ? styles.priceSectionExpanded : ''} ${open === "price" ? styles.active : ''}`}>
            <div className={styles.priceContent} onClick={() => handleFilterClick("price")}>
              {isExpanded && <div className={styles.label}>Price</div>}
              <div
                className={`${styles.value} ${!getPriceLabel() ? styles.placeholder : ''}`}
              >
                {getPriceLabel() || (isExpanded ? "Select Price Range" : "Any Price")}
              </div>
              {open === "price" && <PriceFilter onClose={() => setOpen(null)} />}
            </div>

            <div className={`${styles.searchBtnContainer} ${!isExpanded ? styles.searchBtnContainerExpanded : ''}`}>
              <button className={`${styles.searchBtn} ${isExpanded ? styles.searchBtnExpanded : ''}`} onClick={handleSearch}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                  <circle cx="6.74237" cy="6.74237" r="5.99237" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.9102 11.2214L13.2595 13.5647" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {isExpanded && <span>Search</span>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
