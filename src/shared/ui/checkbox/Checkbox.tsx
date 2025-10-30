"use client";

import styles from "./Checkbox.module.scss";

type CheckboxProps = {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  id?: string;
};

export function Checkbox({ checked, onChange, label, id }: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onChange?.(e.target.checked);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <label className={styles.root} htmlFor={id} onClick={handleClick}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className={styles.input}
        id={id}
      />
      <span className={`${styles.checkbox} ${checked ? styles.checked : ''}`}>
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path 
              d="M10 3L4.5 8.5L2 6" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
