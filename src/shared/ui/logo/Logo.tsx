"use client";
import Link from "next/link";
import styles from "./Logo.module.scss";

type LogoProps = {
  href?: string;
  text?: string;
};

export function Logo({ href = "/", text = "lystio" }: LogoProps) {
  return (
    <Link href={href} aria-label={text} className={styles.root}>
      {text}
    </Link>
  );
}


