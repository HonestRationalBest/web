"use client";

import { TenementGrid } from "@/features/tenement-grid";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.mapPlaceholder}>
      </div>
      <div className={styles.listingsPanel}>
        <TenementGrid />
      </div>
    </main>
  );
}
