import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProductDetail from "./pages/ProductDetail";
import CreativeUpload from "./pages/CreativeUpload";
import Clients from "./pages/Clients";
import Gestores from "./pages/Gestores";
import ClientProducts from "./pages/ClientProducts";
import Contents from "./pages/Contents";
import SwipeFiles from "./pages/SwipeFiles";
import ClientReport from "./pages/ClientReport";
import GestorClientReport from "./pages/GestorClientReport";
import TeamPage from "./pages/TeamPage";
import Avisos from "./pages/Avisos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Dashboard />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/products/:id/upload" element={<CreativeUpload />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:clientId" element={<ClientProducts />} />
            <Route path="/clients/:clientId/report" element={<GestorClientReport />} />
            <Route path="/gestores" element={<Gestores />} />
            <Route path="/conteudos" element={<Contents />} />
            <Route path="/swipe-files" element={<SwipeFiles />} />
            <Route path="/relatorio" element={<ClientReport />} />
            <Route path="/equipe" element={<TeamPage />} />
            <Route path="/avisos" element={<Avisos />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
