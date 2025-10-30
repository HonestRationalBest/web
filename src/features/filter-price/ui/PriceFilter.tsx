"use client";

import { Popup } from "@/shared/ui/popup/Popup";
import { Checkbox } from "@/shared/ui/checkbox";
import { useState } from "react";
import { useFiltersStore } from "@/entities/filters";
import { useTenementHistogram } from "@/entities/tenement";
import styles from "./PriceFilter.module.scss";

const generatePriceOptions = (min: number, max: number): number[] => {
  const options: number[] = [];
  const steps = 7; 

  const range = max - min;
  const stepSize = Math.ceil(range / steps / 100) * 100; 

  for (let i = 0; i < steps; i++) {
    const price = min + (i * stepSize);
    if (price <= max && price > 0) { 
      const roundedPrice = Math.ceil(price / 100) * 100;
      options.push(roundedPrice);
    }
  }

  return options;
};

const formatPrice = (price: number | null, isMax: boolean): string => {
  if (price === null || price === 0) {
    return isMax ? "No Maximum" : "No Minimum";
  }
  return `${price.toLocaleString('de-DE')}€`;
};

type PriceFilterProps = {
  onClose?: () => void;
};

export function PriceFilter({ onClose }: PriceFilterProps = {}) {
  const { withinId, type, rentType, rent, showPriceOnRequest, setRent, setShowPriceOnRequest } = useFiltersStore();
  const [activeSelection, setActiveSelection] = useState<'min' | 'max'>('min');

  const histogramFilter = {
    rentType: rentType,
    ...(withinId.length > 0 && { withinId }),
    ...(type.length > 0 && { type }),
  };

  const { data: histogramData, isLoading: loading } = useTenementHistogram(histogramFilter);
  const priceRange = histogramData?.range || [400, 1800];
  const priceOptions = generatePriceOptions(priceRange[0], priceRange[1]);

  const handlePriceSelect = (value: number | null) => {
    if (activeSelection === 'min') {
      setRent(value || 0, rent[1]);
    } else {
      setRent(rent[0], value || 9999);
    }
  };

  const currentMin = rent[0] === 0 ? null : rent[0];
  const currentMax = rent[1] === 9999 ? null : rent[1];
  const activeValue = activeSelection === 'min' ? currentMin : currentMax;

  const isPriceDisabled = (price: number): boolean => {
    if (activeSelection === 'max' && currentMin !== null) {
      return price < currentMin;
    }
    if (activeSelection === 'min' && currentMax !== null) {
      return price > currentMax;
    }
    return false;
  };

  return (
    <Popup ariaLabel="Price filter" onClose={onClose}>
      <div className={styles.root}>
        <div className={styles.header}>
          <div className={styles.title}>Price Range</div>
        </div>

        <div className={styles.buttons}>
          <div className={styles.buttonGroup}>
            <div className={styles.label}>Min</div>
            <button
              className={`${styles.button} ${activeSelection === 'min' ? styles.active : ''} ${!currentMin ? styles.placeholder : ''}`}
              onClick={() => setActiveSelection('min')}
            >
              {formatPrice(currentMin, false)}
            </button>
          </div>

          <div className={styles.buttonGroup}>
            <div className={styles.label}>Max</div>
            <button
              className={`${styles.button} ${activeSelection === 'max' ? styles.active : ''} ${!currentMax ? styles.placeholder : ''}`}
              onClick={() => setActiveSelection('max')}
            >
              {formatPrice(currentMax, true)}
            </button>
          </div>
        </div>

        <div className={`${styles.priceList} ${activeSelection === 'min' ? styles.leftAlign : styles.rightAlign}`}>
          <div
            className={`${styles.option} ${activeValue === null ? styles.selected : ''}`}
            onClick={() => handlePriceSelect(null)}
          >
            {activeValue === null && (
              <div className={styles.checkIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M10.5868 13.4148L7.75775 10.5868L6.34375 12.0008L10.5868 16.2438L17.6567 9.17281L16.2437 7.75781L10.5868 13.4148Z" fill="#A540F3" />
                </svg>
              </div>
            )}
            <span className={styles.optionText}>
              {activeSelection === 'min' ? 'No Minimum' : 'No Maximum'}
            </span>
          </div>
          {priceOptions.map((price) => {
            const isDisabled = isPriceDisabled(price);
            return (
              <div
                key={price}
                className={`${styles.option} ${activeValue === price ? styles.selected : ''} ${isDisabled ? styles.disabled : ''}`}
                onClick={() => !isDisabled && handlePriceSelect(price)}
              >
                {activeValue === price && (
                  <div className={styles.checkIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M10.5868 13.4148L7.75775 10.5868L6.34375 12.0008L10.5868 16.2438L17.6567 9.17281L16.2437 7.75781L10.5868 13.4148Z" fill="#A540F3" />
                    </svg>
                  </div>
                )}
                <span className={styles.optionText}>
                  {price.toLocaleString('de-DE')}€
                </span>
              </div>
            );
          })}
        </div>

        <div className={styles.footer}>
          <Checkbox
            checked={showPriceOnRequest}
            onChange={(checked) => setShowPriceOnRequest(checked)}
            label='Show listings with "Price on Request"'
            id="showPriceOnRequest"
          />
        </div>
      </div>
    </Popup>
  );
}
