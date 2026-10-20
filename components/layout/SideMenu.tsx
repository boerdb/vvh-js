"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Newspaper,
  Trophy,
  Calendar,
  Building2,
  Users,
  Medal,
  Globe,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { ThemeToggle } from "./ThemeToggle";

const iconMap = {
  home: Home,
  news: Newspaper,
  nevobo: Trophy,
  programma: Calendar,
  waddenhal: Building2,
  uitslagen: Users,
  standen: Medal,
  info: Globe,
} as const;

type PageKey = keyof typeof iconMap;

interface MenuPage {
  title: string;
  url: string;
  icon: PageKey;
}

const APP_PAGES: MenuPage[] = [
  { title: "Home", url: "/home", icon: "home" },
  { title: "Clubnieuws", url: "/news", icon: "news" },
  { title: "Nevobo Nieuws", url: "/nevobo-nieuws", icon: "nevobo" },
  { title: "Programma", url: "/programma", icon: "programma" },
  { title: "Thuis Wedstrijden", url: "/waddenhal", icon: "waddenhal" },
  { title: "Uitslagen", url: "/teams", icon: "uitslagen" },
  { title: "Standen", url: "/standen", icon: "standen" },
  { title: "Info", url: "/info", icon: "info" },
];

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

export function SideMenu({ open, onClose }: SideMenuProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    // Focus naar het menu, en bij sluiten terug naar de menuknop.
    // Safari focust een knop niet bij klikken; dan terug naar de menuknop zelf.
    const active = document.activeElement as HTMLElement | null;
    const opener =
      active && active !== document.body
        ? active
        : document.querySelector<HTMLElement>(".menu-btn, .hero-menu-btn");
    navRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, [open, onClose]);

  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(`${url}/`);

  return (
    <>
      <div
        className={`menu-overlay ${open ? "open" : ""}`}
        onClick={onClose}
        aria-hidden
      />
      <nav
        className={`side-menu ${open ? "open" : ""}`}
        aria-label="Hoofdmenu"
        ref={navRef}
        inert={!open}
      >
        <p className="side-menu-header">VVH HARLINGEN</p>
        <div className="side-menu-nav">
          {APP_PAGES.map((page) => {
            const Icon = iconMap[page.icon];
            return (
              <Link
                key={page.title}
                href={page.url}
                className={`menu-item ${isActive(page.url) ? "active" : ""}`}
                onClick={onClose}
              >
                <Icon size={20} />
                <span>{page.title}</span>
              </Link>
            );
          })}
          <div className="menu-theme-row">
            <ThemeToggle onClose={onClose} />
          </div>
        </div>
        <p
          style={{
            textAlign: "center",
            color: "var(--shell-menu-muted)",
            fontSize: "0.85rem",
            padding: "1rem",
          }}
        >
          © VVH Harlingen
        </p>
      </nav>
    </>
  );
}
