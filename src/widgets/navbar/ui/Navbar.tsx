"use client";

import styles from "./Navbar.module.scss";
import { Toggle } from "@/shared/ui/toggle";
import { useState, useEffect, useRef, useMemo } from "react";
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
  const locationSearchResults = useLocationSearch(locationSearchValue);
  const { data: boundaries } = usePopularBoundaries();
  const { data: allBoundaries } = useAllBoundaries();

  // Get selected locations with IDs and names
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

    // Return locations in the order they appear in withinId
    return withinId
      .map(id => locationMap.get(id))
      .filter((loc): loc is { id: string; name: string } => loc !== undefined);
  }, [withinId, boundaries, allBoundaries]);

  const handleClearLocation = (locationId: string) => {
    const newWithinId = withinId.filter(id => id !== locationId);
    setWithinId(newWithinId);
    if (newWithinId.length === 0) {
      setLocationSearchValue("");
    }
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
    const request: TenementSearchRequest = {
      filter: {
        withinId: withinId.length > 0 ? withinId : undefined,
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

    // First, try exact match
    for (const loc of allLocations) {
      const displayName = (loc.altName || loc.name).toLowerCase();
      if (displayName === searchLower) {
        return loc.id;
      }

      // Check districts
      if (loc.children) {
        for (const child of loc.children) {
          const childDisplayName = (child.altName || child.name).toLowerCase();
          if (childDisplayName === searchLower) {
            return child.id;
          }
        }
      }
    }

    // Then, try partial match
    for (const loc of allLocations) {
      const displayName = (loc.altName || loc.name).toLowerCase();
      if (displayName.includes(searchLower) || searchLower.includes(displayName)) {
        return loc.id;
      }

      // Check districts
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
    // If there's a location search value typed but not selected, try to find the location ID
    let finalWithinId = withinId;

    if (locationSearchValue && locationSearchValue.trim().length > 0 && withinId.length === 0) {
      const foundLocationId = findLocationIdByName(locationSearchValue);
      if (foundLocationId) {
        finalWithinId = [foundLocationId];
        setWithinId(finalWithinId);
        setLocationSearchValue("");
      }
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
                    const { setWithinId, type, rent, rentType, showPriceOnRequest } = useFiltersStore.getState();
                    setWithinId([locationId]);
                    setLocationSearchValue("");
                    setOpen(null);

                    // Trigger search with new filters
                    const request: TenementSearchRequest = {
                      filter: {
                        withinId: [locationId],
                        type: type.length > 0 ? type : undefined,
                        rent: rent[0] > 0 || rent[1] < 9999 ? [rent[0], rent[1]] : undefined,
                        rentType,
                        showPriceOnRequest,
                      },
                      paging: {
                        page: 1,
                        pageSize: 20,
                      },
                    };
                    setRequest(request);
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
