"use client";

import { Popup } from "@/shared/ui/popup/Popup";
import { Checkbox } from "@/shared/ui/checkbox";
import styles from "./LocationFilter.module.scss";
import { usePopularBoundaries, useAllBoundaries } from "@/entities/location";
import { useFiltersStore } from "@/entities/filters";
import { useCallback } from "react";

type LocationFilterProps = {
  onClose?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
};

export function LocationFilter({ onClose, searchValue: externalSearchValue, onSearchChange }: LocationFilterProps = {}) {
  const { data: boundaries, isLoading: loading, error: errorObj } = usePopularBoundaries();
  const { data: allBoundaries, isLoading: loadingAll, error: errorAllObj } = useAllBoundaries();
  const { withinId, setWithinId, setNear, setBbox } = useFiltersStore();
  const searchValue = externalSearchValue || "";

  const error = errorObj ? String(errorObj) : null;
  const errorAll = errorAllObj ? String(errorAllObj) : null;

  const popularIds = new Set(boundaries?.map((b) => b.id) || []);
  const otherBoundaries = allBoundaries?.filter((b) => !popularIds.has(b.id)) || [];

  const allLocations = [...(boundaries || []), ...otherBoundaries];
  const selectedCity = allLocations.find((city) => {
    if (withinId.includes(city.id)) return true;
    return city.children?.some((child) => withinId.includes(child.id));
  }) || null;

  const handleCityClick = (cityId: string) => {
    const targetBoundary = allLocations.find((item) => item.id === cityId);
    if (!targetBoundary) return;

    if (onSearchChange) {
      onSearchChange("");
    }
    setNear(undefined);
    setBbox(undefined);

    if (targetBoundary.children && targetBoundary.children.length > 0) {
      const childIds = targetBoundary.children.map((child) => child.id);
      setWithinId(childIds);
    } else {
      setWithinId([cityId]);
    }
  };

  const handleDistrictToggle = (districtId: string) => {
    const cityId = selectedCity?.id;
    if (!cityId) return;

    if (onSearchChange) {
      onSearchChange("");
    }
    setNear(undefined);
    setBbox(undefined);

    const withoutCity = withinId.filter((id) => id !== cityId);

    if (withinId.includes(districtId)) {
      const newIds = withoutCity.filter((id) => id !== districtId);
      setWithinId(newIds.length > 0 ? newIds : [cityId]);
    } else {
      setWithinId([...withoutCity, districtId]);
    }
  };

  const handleSelectAll = () => {
    if (!selectedCity?.children) return;

    if (onSearchChange) {
      onSearchChange("");
    }
    setNear(undefined);
    setBbox(undefined);

    const allDistrictIds = selectedCity.children.map((c) => c.id);
    const hasAllDistricts = allDistrictIds.every((id) => withinId.includes(id));

    if (hasAllDistricts) {
      setWithinId([selectedCity.id]);
    } else {
      setWithinId(allDistrictIds);
    }
  };

  const showingDistricts = selectedCity && !withinId.includes(selectedCity.id);
  const selectedDistrictIds = showingDistricts
    ? withinId.filter((id) => selectedCity.children?.some((c) => c.id === id))
    : [];

  const getSelectedDistrictCount = (city: any) => {
    if (withinId.includes(city.id)) return 0;
    return city.children?.filter((c: any) => withinId.includes(c.id)).length || 0;
  };

  const handleAddressSelect = useCallback((result: any) => {
    const feature = result.features?.[0];
    if (feature) {
      const coordinates: [number, number] = feature.geometry?.coordinates || [0, 0];
      const bbox = feature.properties?.bbox as [number, number, number, number] | undefined;
      
      setWithinId([]);
      
      setNear({
        coordinates,
        radius: 5000,
      });
      
      if (bbox) {
        setBbox(bbox);
      }
      
      if (onSearchChange) {
        onSearchChange(feature.properties?.full_address || "");
      }
    }
  }, [setWithinId, setNear, setBbox, onSearchChange]);

  const handleClearSearch = () => {
    if (onSearchChange) {
      onSearchChange("");
    }
    setNear(undefined);
    setBbox(undefined);
  };

  return (
    <Popup ariaLabel="Location filter" onClose={onClose}>
      <div className={styles.root}>
        <div className={styles.contentWrapper}>
          <div className={styles.leftPanel}>
            <div className={styles.sectionTitle}>By City</div>
          {loading && <div>Loading popular locations…</div>}
          {error && <div style={{ color: "crimson" }}>{error}</div>}
          {boundaries && boundaries.length > 0 && (
            <div className={styles.cityGrid}>
              {boundaries.map((city) => {
                const districtCount = getSelectedDistrictCount(city);
                const isSelected = withinId.includes(city.id) || districtCount > 0;

                return (
                  <div
                    key={city.id}
                    className={`${styles.cityCard} ${isSelected ? styles.selected : ""}`}
                    onClick={() => handleCityClick(city.id)}
                  >
                    <div className={styles.cityImage}>
                      <img 
                        src={`https://picsum.photos/seed/${city.name}/200/160`} 
                        alt={city.altName || city.name} 
                      />
                      {isSelected && <div className={styles.checkmark}>✓</div>}
                    </div>
                    <div className={styles.cityName}>{city.altName || city.name}</div>
                    {districtCount > 0 && (
                      <div className={styles.cityDistricts}>{districtCount} Selected</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className={styles.sectionTitle}>By State</div>
          {loadingAll && <div>Loading other locations…</div>}
          {errorAll && <div style={{ color: "crimson" }}>{errorAll}</div>}
          {otherBoundaries && otherBoundaries.length > 0 && (
            <div className={styles.list}>
              {otherBoundaries.map((state) => {
                const districtCount = getSelectedDistrictCount(state);
                const totalDistricts = state.children?.length ?? 0;
                const areAllDistrictsSelected = totalDistricts > 0 && districtCount === totalDistricts;
                const isSelected = withinId.includes(state.id) || districtCount > 0;

                return (
                  <div
                    key={state.id}
                    className={`${styles.stateItem} ${isSelected ? styles.selected : ""}`}
                    onClick={() => handleCityClick(state.id)}
                  >
                    <div className={styles.stateImage}>
                      <img 
                        src={`https://picsum.photos/seed/${state.name}/100/100`} 
                        alt={state.altName || state.name} 
                      />
                    </div>
                    <div className={styles.stateInfo}>
                      <div className={styles.stateName}>{state.altName || state.name}</div>
                      <div className={`${styles.stateDistricts} ${(areAllDistrictsSelected || districtCount > 0) ? styles.selected : ""}`}>
                        {areAllDistrictsSelected ? `All Districts` : districtCount > 0 ? `${districtCount} Selected` : `${totalDistricts} Districts`}
                      </div>
                    </div>
                    <div className={styles.stateArrow}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="8" height="13" viewBox="0 0 8 13" fill="none">
                        <path d="M4.94978 6.36398L0 1.41421L1.41422 0L7.77818 6.36398L1.41422 12.7279L0 11.3137L4.94978 6.36398Z" fill="black" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

          {selectedCity && selectedCity.children && selectedCity.children.length > 0 && (
            <div className={styles.rightPanel}>
              <div className={styles.sectionTitle}>{selectedCity.altName || selectedCity.name}</div>

            <div className={styles.allDistrictsSection} onClick={handleSelectAll}>
              <div className={styles.allDistrictsHeader}>
                <Checkbox
                  checked={selectedDistrictIds.length === selectedCity.children.length && selectedDistrictIds.length > 0}
                  onChange={handleSelectAll}
                  id="selectAll"
                />
                <div className={styles.allDistrictsText}>
                  <div className={styles.allDistrictsTitle}>All Districts</div>
                  <div className={styles.allDistrictsCount}>{selectedCity.children.length} Districts</div>
                </div>
              </div>
            </div>

            <div className={styles.districtList}>
              {selectedCity.children.map((district) => (
                <div
                  key={district.id}
                  className={styles.districtItem}
                  onClick={() => handleDistrictToggle(district.id)}
                >
                  <Checkbox
                    checked={withinId.includes(district.id)}
                    onChange={() => handleDistrictToggle(district.id)}
                    label={district.name}
                    id={`district-${district.id}`}
                  />
                </div>
              ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Popup>
  );
}
