"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Layers,
  BarChart3,
  UserCircle,
  LogOut,
  Grid3X3,
  Settings,
  HelpCircle,
  ChevronsLeft,
  ChevronsRight,
  type LucideIcon,
  Warehouse,
  Store,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type MenuItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

interface AdminSidebarProps {
  isOpen: boolean;          // mobile open / desktop expanded
  isCollapsed: boolean;     // desktop collapsed (icon-only)
  onCollapseToggle?: () => void;
  onNavigate?: () => void;  // close mobile on nav
}

const mainItems: MenuItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Categories", href: "/admin/categories", icon: Grid3X3 },
  { name: "Sub Categories", href: "/admin/sub-categories", icon: Layers },
  { name: "Products", href: "/admin/products", icon: Package, badge: "24" },
  {name:"Inventory", href:"/admin/inventory",icon:Warehouse},
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag, badge: "12" },
  {name:"Sales", href:"/admin/sales", icon:Store},
  { name: "Users", href: "/users", icon: Users },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
];

const accountItems: MenuItem[] = [
  { name: "Profile", href: "/profile", icon: UserCircle },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
];

export default function AdminSidebar({
  isOpen,
  isCollapsed,
  onCollapseToggle,
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  // Close mobile on route change
  useEffect(() => {
    onNavigate?.();
  }, [pathname, onNavigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    
    setTimeout(()=>{router.push("/");},1000)
    
  };

  const isItemActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const renderItem = (item: MenuItem) => {
    const isActive = isItemActive(item.href);
    const Icon = item.icon;

    const link = (
      <Link
        href={item.href}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg text-sm font-medium",
          "transition-all duration-200",
          !isCollapsed ? "px-3 py-2.5" : "px-0 py-2.5 justify-center",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon
          className={cn(
            "h-[18px] w-[18px] shrink-0 transition-transform duration-200",
            isActive && "scale-110",
            !isActive && "group-hover:scale-110"
          )}
        />

        {!isCollapsed && (
          <>
            <span className="flex-1 truncate text-left">{item.name}</span>
            {item.badge && (
              <span
                className={cn(
                  "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                )}
              >
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );

    // Collapsed: wrap with tooltip
    if (isCollapsed) {
      return (
        <Tooltip key={item.href} delayDuration={200}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.name}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <li key={item.href}>{link}</li>;
  };

  return (
    <TooltipProvider>
      {/* Mobile overlay with fade animation */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden transition-all duration-300 ease-in-out",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onNavigate}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-white dark:bg-gray-900",
          "border-r border-gray-200 dark:border-gray-800 shadow-2xl",
          "flex flex-col overflow-hidden",
          // Smooth transitions for width and transform
          "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          // Mobile slide with spring-like easing
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          // Desktop width
          isCollapsed ? "lg:w-[72px]" : "lg:w-[260px]",
          // Mobile width with shadow depth
          "w-[280px]",
          // Add shadow on mobile when open
          isOpen && "shadow-2xl lg:shadow-xl"
        )}
        aria-label="Main navigation"
      >
        {/* Header / Logo */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-gray-200 dark:border-gray-800",
            isCollapsed ? "lg:justify-center lg:px-0" : "px-4"
          )}
        >
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 overflow-hidden",
              isCollapsed && "lg:justify-center lg:w-full"
            )}
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary shadow-sm shadow-primary/20">
              <span className="text-sm font-bold text-white">RC</span>
            </div>

            {!isCollapsed && (
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
                  Realtime Commerce
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Admin Panel
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* User card */}
        {user && (
          <div className={cn("shrink-0 px-3 pt-4", isCollapsed && "lg:px-2")}>
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-2.5",
                isCollapsed && "lg:justify-center lg:p-2"
              )}
            >
              <div className="relative shrink-0">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-r from-primary to-secondary text-sm font-semibold text-white">
                  {(user.email?.[0] || "U").toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-900 bg-green-500" />
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {user.email?.split("@")[0]}
                  </p>
                  <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                    Administrator
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto py-4",
            "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
            !isCollapsed ? "px-3" : "px-2"
          )}
        >
          {!isCollapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Main
            </p>
          )}
          <ul className="space-y-1">
            {mainItems.map((item) => renderItem(item))}
          </ul>

          {!isCollapsed ? (
            <p className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Account
            </p>
          ) : (
            <div className="my-4 mx-2 h-px bg-gray-200 dark:bg-gray-800" />
          )}

          <ul className="space-y-1">
            {accountItems.map((item) => renderItem(item))}
          </ul>
        </nav>

        {/* Footer */}
        <div
          className={cn(
            "shrink-0 border-t border-gray-200 dark:border-gray-800 p-3",
            isCollapsed && "lg:p-2"
          )}
        >
          {/* Logout */}
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg text-sm font-medium",
                  "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40",
                  "transition-colors duration-200",
                  !isCollapsed ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
                )}
              >
                <LogOut className="h-[18px] w-[18px] shrink-0" />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Logout</TooltipContent>
            )}
          </Tooltip>

          {/* Desktop collapse toggle - hidden on mobile */}
          {onCollapseToggle && (
            <button
              onClick={onCollapseToggle}
              className={cn(
                "mt-2 hidden w-full items-center gap-2 rounded-lg py-1.5 text-xs font-medium",
                "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
                "lg:flex",
                !isCollapsed ? "px-3" : "px-0 justify-center"
              )}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronsRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronsLeft className="h-4 w-4" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}