"use client";

import styles from "./Popup.module.scss";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type PopupProps = {
  children: ReactNode;
  ariaLabel?: string;
  onClose?: () => void;
};

export function Popup({ children, ariaLabel = "Filter popup", onClose }: PopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onClose) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Small delay to prevent immediate closing on the same click that opened the popup
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleClick = (event: React.MouseEvent) => {
    // Stop propagation to prevent parent onClick handlers from firing
    event.stopPropagation();
  };

  return (
    <div 
      ref={popupRef} 
      className={styles.root} 
      role="dialog" 
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}

