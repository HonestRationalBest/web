"use client";
import { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./IconButton.module.scss";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function IconButton({ children, className, ...props }: IconButtonProps) {
  return (
    <button {...props} className={`${styles.button} ${className ?? ""}`}>
      {children}
    </button>
  );
}


