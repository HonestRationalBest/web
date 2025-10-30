"use client";

import { Popup } from "@/shared/ui/popup/Popup";
import { useFiltersStore } from "@/entities/filters";
import type { Category } from "@/entities/filters";
import categoriesData from "./category.json";
import styles from "./CategoryFilter.module.scss";
import { getCategoryIcon } from "../lib/icons";

type CategoryFilterProps = {
  onClose?: () => void;
};

export function CategoryFilter({ onClose }: CategoryFilterProps = {}) {
  const categories: Category[] = categoriesData;
  const { type, setType } = useFiltersStore();
  const selectedCategoryId = type[0] || null;

  const handleCategoryClick = (cat: Category) => {
    setType([cat.id]);
  };

  return (
    <Popup ariaLabel="Category filter" onClose={onClose}>
      <div className={styles.root}>
        <div className={styles.header}>
          <div className={styles.title}>Category</div>
        </div>
        <div className={styles.list}>
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className={`${styles.item} ${selectedCategoryId === cat.id ? styles.selected : ''}`}
              onClick={() => handleCategoryClick(cat)}
            >
              <div className={styles.icon}>
                {getCategoryIcon(cat.id)}
              </div>
              <div className={styles.name}>{cat.name}</div>
            </div>
          ))}
        </div>
      </div>
    </Popup>
  );
}

