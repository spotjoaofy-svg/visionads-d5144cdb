import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  owner_id: string;
}

interface DateRange {
  label: string;
  days: number;
}

interface AppContextType {
  workspace: Workspace | null;
  workspaces: Workspace[];
  setActiveWorkspace: (w: Workspace) => void;
  dateRange: DateRange;
  setDateRange: (dr: DateRange) => void;
  platformFilter: string;
  setPlatformFilter: (p: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  loadingWorkspace: boolean;
  refetchWorkspaces: () => void;
}

const defaultDateRange: DateRange = { label: "30D", days: 30 };

const AppContext = createContext<AppContextType>({
  workspace: null,
  workspaces: [],
  setActiveWorkspace: () => {},
  dateRange: defaultDateRange,
  setDateRange: () => {},
  platformFilter: "all",
  setPlatformFilter: () => {},
  sidebarOpen: true,
  setSidebarOpen: () => {},
  loadingWorkspace: true,
  refetchWorkspaces: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);

  const fetchWorkspaces = async () => {
    if (!user) { setLoadingWorkspace(false); return; }
    setLoadingWorkspace(true);
    const { data } = await supabase
      .from("workspaces")
      .select("*")
      .order("created_at", { ascending: true });
    if (data && data.length > 0) {
      setWorkspaces(data as Workspace[]);
      setWorkspace((prev) => prev ? (data.find(w => w.id === prev.id) ?? data[0]) as Workspace : data[0] as Workspace);
    } else {
      setWorkspaces([]);
      setWorkspace(null);
    }
    setLoadingWorkspace(false);
  };

  useEffect(() => { fetchWorkspaces(); }, [user]);

  return (
    <AppContext.Provider value={{
      workspace,
      workspaces,
      setActiveWorkspace: setWorkspace,
      dateRange,
      setDateRange,
      platformFilter,
      setPlatformFilter,
      sidebarOpen,
      setSidebarOpen,
      loadingWorkspace,
      refetchWorkspaces: fetchWorkspaces,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
