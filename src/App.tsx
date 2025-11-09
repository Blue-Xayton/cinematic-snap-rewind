import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import { AppLayout } from "./components/layout/AppLayout";
import { OnboardingTutorial } from "./components/OnboardingTutorial";
import Landing from "./pages/Landing";
import Create from "./pages/Create";
import JobList from "./pages/JobList";
import JobDetail from "./pages/JobDetail";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <OnboardingTutorial />
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<AuthGuard><AppLayout><Landing /></AppLayout></AuthGuard>} />
          <Route path="/create" element={<AuthGuard><AppLayout><Create /></AppLayout></AuthGuard>} />
          <Route path="/jobs" element={<AuthGuard><AppLayout><JobList /></AppLayout></AuthGuard>} />
          <Route path="/jobs/:jobId" element={<AuthGuard><AppLayout><JobDetail /></AppLayout></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><AppLayout><Profile /></AppLayout></AuthGuard>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
