import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import MetaDashboard from "./pages/MetaDashboard";
import GoogleDashboard from "./pages/GoogleDashboard";
import TikTokDashboard from "./pages/TikTokDashboard";
import Rankings from "./pages/Rankings";
import AIAgent from "./pages/AIAgent";
import CreativeAudit from "./pages/CreativeAudit";
import Settings from "./pages/Settings";
import Permissions from "./pages/Permissions";
import MetaAdsPage from "./pages/MetaAdsPage";
import CatalogsPage from "./pages/CatalogsPage";
import PagesManagementPage from "./pages/PagesManagementPage";
import LeadsPage from "./pages/LeadsPage";
import EngagementPage from "./pages/EngagementPage";
import ThreadsPage from "./pages/ThreadsPage";
import PageAdsPage from "./pages/PageAdsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return (
    <AppProvider>
      <DashboardLayout />
    </AppProvider>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route element={<ProtectedRoutes />}>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard/meta" element={<MetaDashboard />} />
                <Route path="/dashboard/google" element={<GoogleDashboard />} />
                <Route path="/dashboard/tiktok" element={<TikTokDashboard />} />
                <Route path="/rankings" element={<Rankings />} />
                <Route path="/ai-agent" element={<AIAgent />} />
                <Route path="/creative-audit" element={<CreativeAudit />} />
                <Route path="/settings" element={<Settings />} />
                {/* Facebook/Meta Integration Routes */}
                <Route path="/facebook/permissions" element={<Permissions />} />
                <Route path="/facebook/ads" element={<MetaAdsPage />} />
                <Route path="/facebook/catalogs" element={<CatalogsPage />} />
                <Route path="/facebook/pages" element={<PagesManagementPage />} />
                <Route path="/facebook/leads" element={<LeadsPage />} />
                <Route path="/facebook/engagement" element={<EngagementPage />} />
                <Route path="/facebook/threads" element={<ThreadsPage />} />
                <Route path="/facebook/page-ads" element={<PageAdsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
