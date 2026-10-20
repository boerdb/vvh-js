"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, Medal, Menu, Trophy } from "lucide-react";

const TABS = [
  { title: "Home", url: "/home", Icon: Home },
  { title: "Programma", url: "/programma", Icon: Calendar },
  { title: "Uitslagen", url: "/teams", Icon: Trophy },
  { title: "Standen", url: "/standen", Icon: Medal },
] as const;

interface TabBarProps {
  onMore: () => void;
  menuOpen: boolean;
}

/** Vaste navigatie onderin; de overige pagina's zitten achter "Meer" (zijmenu). */
export function TabBar({ onMore, menuOpen }: TabBarProps) {
  const pathname = usePathname();
  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(`${url}/`);
  const inTabs = TABS.some((tab) => isActive(tab.url));

  return (
    <nav className="tab-bar" aria-label="Snelmenu">
      <div className="tab-bar-inner">
        {TABS.map(({ title, url, Icon }) => {
          const active = isActive(url);
          return (
            <Link
              key={url}
              href={url}
              className={`tab-bar-item ${active ? "active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={22} aria-hidden />
              <span>{title}</span>
            </Link>
          );
        })}
        <button
          type="button"
          className={`tab-bar-item ${menuOpen || !inTabs ? "active" : ""}`}
          onClick={onMore}
          aria-label="Meer: nieuws, thuiswedstrijden, info en thema"
          aria-expanded={menuOpen}
        >
          <Menu size={22} aria-hidden />
          <span>Meer</span>
        </button>
      </div>
    </nav>
  );
}
