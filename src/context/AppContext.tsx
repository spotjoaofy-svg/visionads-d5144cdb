import React, { createContext, useContext, useState, ReactNode } from "react";

interface DateRange {
  label: string;
  days: number;
}

interface AppContextType {
  workspace: string;
  setWorkspace: (w: string) => void;
  dateRange: DateRange;
  setDateRange: (dr: DateRange) => void;
  platformFilter: string;
  setPlatformFilter: (p: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

const defaultDateRange: DateRange = { label: "30D", days: 30 };

// Single-company mode: fixed workspace name
const FIXED_WORKSPACE_NAME = "VisionAds";

const AppContext = createContext<AppContextType>({
  workspace: FIXED_WORKSPACE_NAME,
  setWorkspace: () => {},
  dateRange: defaultDateRange,
  setDateRange: () => {},
  platformFilter: "all",
  setPlatformFilter: () => {},
  sidebarOpen: true,
  setSidebarOpen: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  // workspace is fixed for single-company mode
  const workspace = FIXED_WORKSPACE_NAME;
  const setWorkspace = (_: string) => {
    /* no-op intentionally: app runs in single-company mode */
  };

  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AppContext.Provider
      value={{
        workspace,
        setWorkspace,
        dateRange,
        setDateRange,
        platformFilter,
        setPlatformFilter,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
