"use client";

import Image from "next/image";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { BannerStack } from "./BannerStack";
import { SideMenu } from "./SideMenu";

interface MenuContextValue {
  openMenu: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used within AppShell");
  return ctx;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === "/home" || pathname === "/";

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const menuValue = useMemo(() => ({ openMenu }), [openMenu]);

  return (
    <MenuContext.Provider value={menuValue}>
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="app-shell">
        {!isHome && (
          <header className="app-header">
            <button
              type="button"
              className="menu-btn"
              onClick={openMenu}
              aria-label="Menu openen"
            >
              <Menu size={24} />
            </button>
            <h1 className="app-header-title">VVH Harlingen</h1>
          <Image
            src="/logo-vvh.png"
            alt="VVH Harlingen"
            width={120}
            height={40}
            className="header-logo"
            priority
          />
          </header>
        )}

        <BannerStack />

        <main className={`main-content ${isHome ? "home-layout" : ""}`}>
          {children}
        </main>
      </div>
    </MenuContext.Provider>
  );
}
