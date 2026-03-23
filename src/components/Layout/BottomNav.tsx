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
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Início", path: "/" },
  { icon: BarChart3, label: "Meta", path: "/dashboard/meta" },
  { icon: Bot, label: "AI", path: "/ai-agent" },
  { icon: Trophy, label: "Rankings", path: "/rankings" },
  { icon: Settings, label: "Config", path: "/settings" },
];

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border">
      <div className="flex items-center justify-around h-16 px-1 safe-area-pb">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full px-1 transition-all",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", active && "scale-110 transition-transform")} />
              <span className="text-[9px] font-medium leading-none tracking-wide">
                {item.label}
              </span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
