"use client";

import { useRouter, usePathname } from "next/navigation";
import styles from "./MobileNav.module.css";

/**
 * MobileNav — bottom navigation bar for mobile with quick links.
 */
export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { href: "/chat", label: "Chat", icon: "💬" },
    { href: "/evolution", label: "Evolution", icon: "🧬" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <nav className={styles.nav}>
      {navItems.map((item) => (
        <button
          key={item.href}
          className={`${styles.item} ${pathname === item.href ? styles.active : ""}`}
          onClick={() => router.push(item.href)}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
