import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

// Pages
import Index from "./pages/Index";
import Treinamentos from "./pages/Treinamentos";
import Financeiro from "./pages/Financeiro";
import Chamados from "./pages/Chamados";
import NovoChamado from "./pages/NovoChamado";
import Equipamentos from "./pages/Equipamentos";
import Perfil from "./pages/Perfil";
import Contrato from "./pages/Contrato";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Área Técnica
import TecnicoDashboard from "./pages/tecnico/TecnicoDashboard";
import OrdemServico from "./pages/tecnico/OrdemServico";
import AssinaturaDigital from "./pages/tecnico/AssinaturaDigital";
import TecnicoRotas from "./pages/tecnico/TecnicoRotas";
import TecnicoPerfil from "./pages/tecnico/TecnicoPeril";
import TecnicoChat from "./pages/tecnico/TecnicoChat";

// Área Coordenador
import CoordenadorDashboard from "./pages/coordenador/CoordenadorDashboard";
import CoordenadorChat from "./pages/coordenador/CoordenadorChat";
import GerenciarTreinamentos from "./pages/coordenador/GerenciarTreinamentos";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function RoleBasedRedirect() {
  const { profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (profile?.tipo === "coordenador") {
    return <Navigate to="/coordenador" replace />;
  }
  
  if (profile?.tipo === "tecnico") {
    return <Navigate to="/tecnico" replace />;
  }
  
  return <Index />;
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      
      {/* Redirect based on role */}
      <Route path="/" element={<ProtectedRoute><RoleBasedRedirect /></ProtectedRoute>} />
      
      {/* Área do Cliente */}
      <Route path="/home" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/treinamentos" element={<ProtectedRoute><Treinamentos /></ProtectedRoute>} />
      <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
      <Route path="/chamados" element={<ProtectedRoute><Chamados /></ProtectedRoute>} />
      <Route path="/chamados/novo" element={<ProtectedRoute><NovoChamado /></ProtectedRoute>} />
      <Route path="/equipamentos" element={<ProtectedRoute><Equipamentos /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
      <Route path="/perfil/contrato" element={<ProtectedRoute><Contrato /></ProtectedRoute>} />
      
      {/* Área Técnica */}
      <Route path="/tecnico" element={<ProtectedRoute><TecnicoDashboard /></ProtectedRoute>} />
      <Route path="/tecnico/rotas" element={<ProtectedRoute><TecnicoRotas /></ProtectedRoute>} />
      <Route path="/tecnico/ordem/:id" element={<ProtectedRoute><OrdemServico /></ProtectedRoute>} />
      <Route path="/tecnico/ordem/:id/assinatura" element={<ProtectedRoute><AssinaturaDigital /></ProtectedRoute>} />
      <Route path="/tecnico/perfil" element={<ProtectedRoute><TecnicoPerfil /></ProtectedRoute>} />
      <Route path="/tecnico/chat" element={<ProtectedRoute><TecnicoChat /></ProtectedRoute>} />
      
      {/* Área Coordenador (Valdemar) */}
      <Route path="/coordenador" element={<ProtectedRoute><CoordenadorDashboard /></ProtectedRoute>} />
      <Route path="/coordenador/chat/:tecnicoId" element={<ProtectedRoute><CoordenadorChat /></ProtectedRoute>} />
      <Route path="/coordenador/treinamentos" element={<ProtectedRoute><GerenciarTreinamentos /></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
