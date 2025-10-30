"use client";

import styles from "./Toggle.module.scss";

type ToggleOption<T> = {
  value: T;
  label: string;
};

type ToggleProps<T extends string> = {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function Toggle<T extends string>({ options, value, onChange }: ToggleProps<T>) {
  return (
    <div className={styles.root}>
      {options.map((option) => (
        <button
          key={option.value}
          className={`${styles.button} ${value === option.value ? styles.active : ""}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

