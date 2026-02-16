"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderOpen,
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
  SheetTrigger,
} from "~/components/ui/sheet";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Mes Stratégies",
    href: "/strategies",
    icon: FolderOpen,
  },
  {
    label: "Nouvelle Stratégie",
    href: "/strategy/new",
    icon: Plus,
  },
  {
    label: "Paramètres",
    href: "/settings",
    icon: Settings,
  },
];

function NavLink({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70",
        collapsed && "justify-center px-2",
      )}
    >
      <Icon className="size-5 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo / Title */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        {collapsed ? (
          <span className="mx-auto text-lg font-bold text-sidebar-primary">
            A
          </span>
        ) : (
          <span className="text-xl font-bold tracking-tight text-sidebar-primary">
            ADVERTIS
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-3 py-3">
        {!collapsed && (
          <p className="text-xs text-sidebar-foreground/50">
            ADVERTIS v1.0
          </p>
        )}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(true)}
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
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-5" />
              <span className="sr-only">Fermer le menu</span>
            </Button>
          </div>
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 lg:flex",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarContent collapsed={collapsed} />

        {/* Collapse toggle */}
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
            <span className="sr-only">
              {collapsed ? "Ouvrir la barre latérale" : "Réduire la barre latérale"}
            </span>
          </Button>
        </div>
      </aside>
    </>
  );
}
