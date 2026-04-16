import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AutoLogout from "@/components/AutoLogout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import SymptomChecker from "./pages/SymptomChecker";
import DiseasePredictor from "./pages/DiseasePredictor";
import HealthChatbot from "./pages/HealthChatbot";
import HospitalFinder from "./pages/HospitalFinder";
import DietPlanner from "./pages/DietPlanner";
import HealthHistory from "./pages/HealthHistory";
import Profile from "./pages/Profile";
import MedicineRecommender from "./pages/MedicineRecommender";
import MedicationReminder from "./pages/MedicationReminder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}>
        {/* Auto-logout after 30 minutes of inactivity */}
        <AutoLogout />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/symptom-checker" element={<SymptomChecker />} />
          <Route path="/disease-predictor" element={<DiseasePredictor />} />
          <Route path="/health-chatbot" element={<HealthChatbot />} />
          <Route path="/hospital-finder" element={<HospitalFinder />} />
          <Route path="/diet-planner" element={<DietPlanner />} />
          <Route path="/health-history" element={<HealthHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/medicine-recommender" element={<MedicineRecommender />} />
          <Route path="/medication-reminder" element={<MedicationReminder />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;