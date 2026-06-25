"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { cn } from "@/lib/utils";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Mobile-only overlay state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Desktop collapsed (icon-only) state — persisted
  const [collapsed, setCollapsed] = useState(false);

  // Viewport flag
  const [isDesktop, setIsDesktop] = useState(false);

  // Track viewport
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handle = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsDesktop(e.matches);
    handle(mq);
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);

  // Reset mobile overlay on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Restore persisted collapsed state
  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  // Stable callbacks (prevent useEffect loops in children)
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin-sidebar-collapsed", String(next));
      return next;
    });
  }, []);

  /**
   * Sidebar is in "expanded" mode (shows labels) when:
   *   - On desktop (always — desktop users always see labels unless collapsed), OR
   *   - On mobile with the overlay open
   * On mobile-closed, the sidebar slides off-screen entirely.
   */
  const sidebarOpen = isDesktop || mobileOpen;
  const effectiveCollapsed = collapsed && isDesktop;

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <AdminSidebar
        isOpen={sidebarOpen}
        isCollapsed={effectiveCollapsed}
        onCollapseToggle={toggleCollapsed}
        onNavigate={closeMobile}
      />

      <div
        className={cn(
          "transition-[margin] duration-300 ease-[cubic-bezier(.32,.72,0,1)]",
          // Desktop: shift main content to make room for sidebar
          isDesktop &&
            (effectiveCollapsed
              ? "lg:ml-[var(--sidebar-width-collapsed)]"
              : "lg:ml-[var(--sidebar-width)]"),
          // Mobile: no margin (sidebar overlays)
          !isDesktop && "ml-0"
        )}
      >
        <AdminHeader
          sidebarOpen={mobileOpen}
          setSidebarOpen={setMobileOpen}
          isCollapsed={effectiveCollapsed}
          isMobile={!isDesktop}
        />

        <main
          id="main-content"
          className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8"
        >
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}