import { useState } from "react";
import { Bell, ChevronDown, Settings, LogOut, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, BarChart3, Search, Music2, Trophy, Bot, Palette,
} from "lucide-react";
import logo from "@/assets/visionads-logo.png";

const allNavItems = [
  { icon: LayoutDashboard, label: "Visão Geral", path: "/", comingSoon: false },
  { icon: BarChart3, label: "Meta Ads", path: "/dashboard/meta", comingSoon: false },
  { icon: Search, label: "Google Ads", path: "/dashboard/google", comingSoon: true },
  { icon: Music2, label: "TikTok Ads", path: "/dashboard/tiktok", comingSoon: true },
  { icon: Trophy, label: "Rankings", path: "/rankings", comingSoon: false },
  { icon: Bot, label: "AI Agent", path: "/ai-agent", comingSoon: false },
  { icon: Palette, label: "Creative Audit", path: "/creative-audit", comingSoon: false },
  { icon: Settings, label: "Configurações", path: "/settings", comingSoon: false },
];

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const location = useLocation();
  const [notifCount] = useState(3);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
      <header className="h-14 flex items-center justify-between px-3 md:px-5 border-b border-border bg-surface-elevated flex-shrink-0 z-40">
        {/* Left: hamburger (mobile) + brand name */}
        <div className="flex items-center gap-2">
          <button
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Mobile: show logo + name */}
          <div className="md:hidden flex items-center gap-2">
            <img src={logo} alt="VisionAds" className="h-6 w-auto object-contain" />
            <span className="font-bold text-base text-foreground tracking-tight">VisionAds</span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="relative w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Bell className="w-4 h-4" />
            {notifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-destructive" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-1.5 hover:bg-muted">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">V</AvatarFallback>
                </Avatar>
                <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-surface-raised border-border">
              <DropdownMenuItem className="text-sm cursor-pointer">
                <User className="mr-2 h-4 w-4" /> Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm cursor-pointer">
                <Settings className="mr-2 h-4 w-4" /> Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="text-sm text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile full-screen drawer nav */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <nav
            className="relative z-10 w-72 max-w-[85vw] h-full bg-sidebar border-r border-sidebar-border flex flex-col animate-slide-in-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Logo */}
            <div className="flex items-center gap-2.5 h-14 px-5 border-b border-sidebar-border flex-shrink-0">
              <img src={logo} alt="VisionAds" className="h-7 w-auto object-contain" />
              <span className="font-bold text-lg text-foreground tracking-tight">VisionAds</span>
            </div>

            {/* Nav items */}
            <ul className="flex-1 py-4 overflow-y-auto space-y-0.5 px-3">
              {allNavItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.path === "/"}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all",
                        active
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                      <div className="flex flex-col min-w-0">
                        <span className="leading-tight">{item.label}</span>
                        {item.comingSoon && (
                          <span className="text-[9px] text-muted-foreground/60 leading-tight">em breve</span>
                        )}
                      </div>
                      {active && !item.comingSoon && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
