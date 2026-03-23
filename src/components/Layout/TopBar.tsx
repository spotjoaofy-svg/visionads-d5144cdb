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
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, BarChart3, Search, Music2, Trophy, Bot, Palette, Zap,
} from "lucide-react";

const workspaces = ["Loja Exemplo BR", "Agência Central", "E-commerce Plus"];

const allNavItems = [
  { icon: LayoutDashboard, label: "Visão Geral", path: "/" },
  { icon: BarChart3, label: "Meta Ads", path: "/dashboard/meta" },
  { icon: Search, label: "Google Ads", path: "/dashboard/google" },
  { icon: Music2, label: "TikTok Ads", path: "/dashboard/tiktok" },
  { icon: Trophy, label: "Rankings", path: "/rankings" },
  { icon: Bot, label: "AI Agent", path: "/ai-agent" },
  { icon: Palette, label: "Creative Audit", path: "/creative-audit" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { workspace, setWorkspace } = useApp();
  const location = useLocation();
  const [notifCount] = useState(3);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
      <header className="h-14 flex items-center justify-between px-3 md:px-5 border-b border-border bg-surface-elevated flex-shrink-0 z-40">
        {/* Left: hamburger (mobile) + workspace */}
        <div className="flex items-center gap-2">
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Workspace selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-sm font-medium text-foreground hover:bg-muted h-8 px-2"
              >
                <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-primary">LE</span>
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">{workspace}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 bg-surface-raised border-border">
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws}
                  onClick={() => setWorkspace(ws)}
                  className={cn("cursor-pointer text-sm", ws === workspace && "text-primary bg-primary/10")}
                >
                  {ws}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
                  <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">AO</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium text-foreground max-w-[90px] truncate">
                  Ana Oliveira
                </span>
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
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          {/* Drawer */}
          <nav
            className="relative z-10 w-72 max-w-[85vw] h-full bg-sidebar border-r border-sidebar-border flex flex-col animate-slide-in-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Logo */}
            <div className="flex items-center gap-2.5 h-14 px-5 border-b border-sidebar-border flex-shrink-0">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-primary-foreground fill-current" />
              </div>
              <span className="font-bold text-lg text-foreground tracking-tight">AdMind</span>
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
                      {item.label}
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
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
