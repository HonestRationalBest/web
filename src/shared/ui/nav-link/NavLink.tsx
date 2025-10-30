"use client";
import Link from "next/link";
import { ReactNode } from "react";
import styles from "./NavLink.module.scss";

type NavLinkProps = {
  href: string;
  children: ReactNode;
  active?: boolean;
};

export function NavLink({ href, children, active = false }: NavLinkProps) {
  return (
    <Link href={href} className={`${styles.link} ${active ? styles.active : ""}`}>
      {children}
    </Link>
  );
}


