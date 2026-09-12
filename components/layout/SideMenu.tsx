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
import { useEffect, useState } from "react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(`${url}/`);

  if (!mounted) return null;

  return (
    <>
      <div
        className={`menu-overlay ${open ? "open" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <nav
        className={`side-menu ${open ? "open" : ""}`}
        aria-label="Hoofdmenu"
        aria-hidden={!open}
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
