import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3,
  Search,
  Music2,
  Trophy,
  Bot,
  Palette,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { icon: LayoutDashboard, label: "Visão Geral", path: "/" },
  { icon: BarChart3, label: "Meta Ads", path: "/dashboard/meta" },
  { icon: Search, label: "Google Ads", path: "/dashboard/google" },
  { icon: Music2, label: "TikTok Ads", path: "/dashboard/tiktok" },
  { icon: Trophy, label: "Rankings", path: "/rankings" },
  { icon: Bot, label: "AI Agent", path: "/ai-agent" },
  { icon: Palette, label: "Creative Audit", path: "/creative-audit" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
}

export function Sidebar({ collapsed, onToggle, onMobileClose }: SidebarProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground fill-current" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-foreground tracking-tight truncate">
              VisionAds
            </span>
          )}
        </div>
        {/* Mobile close button */}
        {!collapsed && onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const linkEl = (
              <NavLink
                to={item.path}
                end={item.path === "/"}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 group",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon
                  className={cn(
                    "flex-shrink-0 w-4 h-4 transition-colors",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {active && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                )}
              </NavLink>
            );

            return (
              <li key={item.path}>
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                    <TooltipContent side="right" className="bg-surface-raised border-border text-foreground">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  linkEl
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle — desktop only */}
      <div className="p-3 border-t border-sidebar-border flex-shrink-0 hidden lg:block">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-sm"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
