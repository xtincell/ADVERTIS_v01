"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Plus,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  AdvertisMonogram,
  AdvertisWordmark,
} from "~/components/brand/advertis-logo";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Nouvelle Fiche",
    href: "/strategy/new",
    icon: Plus,
  },
  {
    label: "Paramètres",
    href: "/settings",
    icon: Settings,
  },
];

const SIDEBAR_COLLAPSED_KEY = "advertis-sidebar-collapsed";

function NavLink({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  // Active if exact match or if navigating within (e.g. /strategy/new)
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  const linkElement = (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive
          ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
          : "font-medium text-sidebar-foreground/70",
        collapsed && "justify-center px-2",
      )}
    >
      <Icon className="size-[18px] shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );

  // Show tooltip when collapsed to indicate meaning of icon
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkElement}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkElement;
}

function SidebarContent({
  collapsed,
  onNavClick,
}: {
  collapsed: boolean;
  onNavClick?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo / Brand Mark */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        {collapsed ? (
          <div className="mx-auto">
            <AdvertisMonogram size={28} variant="color" />
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <AdvertisMonogram size={24} variant="color" />
            <AdvertisWordmark className="text-lg text-sidebar-primary" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navigation principale">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              onClick={onNavClick}
            />
          ))}
        </TooltipProvider>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-3 py-3">
        {!collapsed && (
          <span className="inline-flex items-center rounded-full bg-sidebar-accent/50 px-2.5 py-0.5 text-[10px] font-medium text-sidebar-foreground/50">
            v1.0
          </span>
        )}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Persist collapse state to localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (stored !== null) {
        setCollapsed(stored === "true");
      }
    } catch {
      // localStorage not available — ignore
    }
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // localStorage not available — ignore
      }
      return next;
    });
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      {/* Mobile trigger button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Ouvrir le menu de navigation"
      >
        <Menu className="size-5" />
        <span className="sr-only">Ouvrir le menu</span>
      </Button>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-64 bg-sidebar p-0 text-sidebar-foreground"
          showCloseButton={false}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-end p-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={closeMobile}
              aria-label="Fermer le menu de navigation"
            >
              <X className="size-5" />
              <span className="sr-only">Fermer le menu</span>
            </Button>
          </div>
          <SidebarContent collapsed={false} onNavClick={closeMobile} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden h-screen flex-col bg-sidebar text-sidebar-foreground sidebar-transition lg:flex",
          collapsed ? "w-16" : "w-64",
        )}
        aria-label="Barre latérale de navigation"
      >
        <SidebarContent collapsed={collapsed} />

        {/* Collapse toggle */}
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleToggleCollapse}
            aria-label={collapsed ? "Déplier la barre latérale" : "Réduire la barre latérale"}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
