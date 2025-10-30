"use client";

import styles from "./MapSearchPopup.module.scss";
import { useMemo } from "react";

type MapSearchPopupProps = {
  searchValue: string;
  results: Array<{
    id: string;
    name: string;
    altName?: string;
    type: "state" | "city" | "district";
    hasChildren: boolean;
  }>;
  onClose?: () => void;
  onSelectLocation: (locationId: string, locationName: string) => void;
};

const RESULTS_LIMIT = 5;

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 12 14" fill="none">
    <path d="M9.90934 9.90904L9.118 10.6917C8.53489 11.2641 7.778 12.0001 6.84734 12.8997C6.56762 13.1702 6.19376 13.3214 5.80467 13.3214C5.41558 13.3214 5.04172 13.1702 4.762 12.8997L2.43534 10.6357C2.142 10.3486 1.89689 10.1064 1.7 9.90904C0.888247 9.09723 0.335448 8.06293 0.111507 6.93695C-0.112433 5.81096 0.00254273 4.64386 0.441896 3.58322C0.88125 2.52258 1.62525 1.61604 2.57981 0.978234C3.53438 0.340427 4.65663 0 5.80467 0C6.95271 0 8.07496 0.340427 9.02953 0.978234C9.98409 1.61604 10.7281 2.52258 11.1674 3.58322C11.6068 4.64386 11.7218 5.81096 11.4978 6.93695C11.2739 8.06293 10.7211 9.09723 9.90934 9.90904ZM7.472 5.98771C7.472 5.54568 7.29641 5.12175 6.98385 4.80919C6.67129 4.49663 6.24736 4.32104 5.80534 4.32104C5.36331 4.32104 4.93939 4.49663 4.62683 4.80919C4.31426 5.12175 4.13867 5.54568 4.13867 5.98771C4.13867 6.42973 4.31426 6.85366 4.62683 7.16622C4.93939 7.47878 5.36331 7.65437 5.80534 7.65437C6.24736 7.65437 6.67129 7.47878 6.98385 7.16622C7.29641 6.85366 7.472 6.42973 7.472 5.98771Z" fill="#A540F3"/>
  </svg>
);

export function MapSearchPopup({ searchValue, results, onClose, onSelectLocation }: MapSearchPopupProps) {

  const groupedResults = useMemo(() => {
    const states = results.filter(loc => loc.type === "state").slice(0, RESULTS_LIMIT);
    const cities = results.filter(loc => loc.type === "city").slice(0, RESULTS_LIMIT);
    const districts = results.filter(loc => loc.type === "district").slice(0, RESULTS_LIMIT);

    return { states, cities, districts };
  }, [results]);

  const handleSelect = (locationId: string, locationName: string) => {
    onSelectLocation(locationId, locationName);
    onClose?.();
  };

  const highlightMatch = (text: string, search: string) => {
    const index = text.toLowerCase().indexOf(search.toLowerCase());
    if (index === -1) return <span>{text}</span>;

    const before = text.substring(0, index);
    const match = text.substring(index, index + search.length);
    const after = text.substring(index + search.length);

    return (
      <>
        {before}
        <span className={styles.match}>{match}</span>
        <span className={styles.gray}>{after}</span>
      </>
    );
  };

  const renderGroup = (title: string, items: MapSearchPopupProps["results"], typeLabel: string) => {
    if (items.length === 0) return null;

    return (
      <>
        <div className={styles.groupHeader}>{title}</div>
        {items.map((item) => (
          <div
            key={item.id}
            className={styles.resultItem}
            onClick={() => handleSelect(item.id, item.name)}
          >
            <div className={styles.iconWrapper}>
              <LocationIcon />
            </div>
            <div className={styles.resultContent}>
              <div className={styles.resultName}>
                {highlightMatch(item.name, searchValue)}
              </div>
              <div className={styles.resultType}>{typeLabel}</div>
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className={styles.root}>
      {renderGroup("States", groupedResults.states, "State")}
      {groupedResults.states.length > 0 && groupedResults.cities.length > 0 && (
        <div className={styles.divider} />
      )}
      {renderGroup("Cities", groupedResults.cities, "City")}
      {groupedResults.cities.length > 0 && groupedResults.districts.length > 0 && (
        <div className={styles.divider} />
      )}
      {renderGroup("District", groupedResults.districts, "Municipality")}
    </div>
  );
}

