import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import Integrations from "./pages/Integrations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner theme="dark" />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/integrations/facebook/callback" element={<Integrations />} />
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard/meta" element={<MetaDashboard />} />
              <Route path="/dashboard/google" element={<GoogleDashboard />} />
              <Route path="/dashboard/tiktok" element={<TikTokDashboard />} />
              <Route path="/rankings" element={<Rankings />} />
              <Route path="/ai-agent" element={<AIAgent />} />
              <Route path="/creative-audit" element={<CreativeAudit />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/integrations" element={<Integrations />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
