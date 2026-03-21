import { useState } from "react";
import { Bell, ChevronDown, Settings, LogOut, User, Menu } from "lucide-react";
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

const workspaces = ["Loja Exemplo BR", "Agência Central", "E-commerce Plus"];

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { workspace, setWorkspace } = useApp();
  const [notifCount] = useState(3);

  return (
    <header className="h-14 flex items-center justify-between px-3 sm:px-4 md:px-6 border-b border-border bg-surface-elevated flex-shrink-0 gap-2">
      {/* Left: hamburger (mobile) + workspace selector */}
      <div className="flex items-center gap-1 min-w-0">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden flex-shrink-0 w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={onMenuClick}
        >
          <Menu className="w-4 h-4" />
        </Button>

        {/* Workspace selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-sm font-medium text-foreground hover:bg-muted h-8 px-2 sm:px-3 min-w-0"
            >
              <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-primary">LE</span>
              </div>
              <span className="hidden sm:block max-w-[120px] md:max-w-[160px] truncate">{workspace}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-56 bg-surface-raised border-border"
          >
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws}
                onClick={() => setWorkspace(ws)}
                className={cn(
                  "cursor-pointer text-sm",
                  ws === workspace && "text-primary bg-primary/10"
                )}
              >
                {ws}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Bell className="w-4 h-4" />
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
          )}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-2 hover:bg-muted">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
                  AO
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium text-foreground max-w-[100px] truncate">
                Ana Oliveira
              </span>
              <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0 hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-surface-raised border-border"
          >
            <DropdownMenuItem className="text-sm cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="text-sm cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-sm text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
