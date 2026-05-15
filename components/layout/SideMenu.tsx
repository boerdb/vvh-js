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
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useCallback, useState } from "react";
import { VVH_TEAMS } from "@/lib/constants/teams";
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
  submenu?: typeof VVH_TEAMS;
  teamRoute?: string;
}

const APP_PAGES: MenuPage[] = [
  { title: "Home", url: "/home", icon: "home" },
  { title: "Clubnieuws", url: "/news", icon: "news" },
  { title: "Nevobo Nieuws", url: "/nevobo-nieuws", icon: "nevobo" },
  { title: "Programma", url: "/programma", icon: "programma" },
  { title: "Thuis Wedstrijden", url: "/waddenhal", icon: "waddenhal" },
  {
    title: "Uitslagen",
    url: "/teams",
    icon: "uitslagen",
    teamRoute: "/team",
    submenu: VVH_TEAMS,
  },
  {
    title: "Standen",
    url: "/standen",
    icon: "standen",
    teamRoute: "/standen",
    submenu: VVH_TEAMS,
  },
  { title: "Info", url: "/info", icon: "info" },
];

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

export function SideMenu({ open, onClose }: SideMenuProps) {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = useCallback((title: string) => {
    setOpenSubmenu((prev) => (prev === title ? null : title));
  }, []);

  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(`${url}/`);

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
            if (!page.submenu) {
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
            }

            const expanded = openSubmenu === page.title;
            return (
              <div key={page.title}>
                <button
                  type="button"
                  className="menu-item"
                  onClick={() => toggleSubmenu(page.title)}
                >
                  <Icon size={20} />
                  <span style={{ flex: 1 }}>{page.title}</span>
                  {expanded ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </button>
                {expanded && page.teamRoute && (
                  <div className="submenu-list">
                    {page.submenu.map((team) => (
                      <Link
                        key={team.code}
                        href={`${page.teamRoute}/${team.code}`}
                        className={`submenu-item ${
                          pathname === `${page.teamRoute}/${team.code}`
                            ? "active"
                            : ""
                        }`}
                        onClick={onClose}
                      >
                        {team.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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
