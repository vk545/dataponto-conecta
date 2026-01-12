import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Treinamentos from "./pages/Treinamentos";
import Financeiro from "./pages/Financeiro";
import Chamados from "./pages/Chamados";
import NovoChamado from "./pages/NovoChamado";
import Equipamentos from "./pages/Equipamentos";
import Perfil from "./pages/Perfil";
import Contrato from "./pages/Contrato";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Área Técnica
import TecnicoDashboard from "./pages/tecnico/TecnicoDashboard";
import OrdemServico from "./pages/tecnico/OrdemServico";
import AssinaturaDigital from "./pages/tecnico/AssinaturaDigital";
import TecnicoRotas from "./pages/tecnico/TecnicoRotas";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = localStorage.getItem("dataponto_auth") === "true";
  
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

const App = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Área do Cliente */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/treinamentos" element={<ProtectedRoute><Treinamentos /></ProtectedRoute>} />
            <Route path="/treinamentos/agendar" element={<ProtectedRoute><Treinamentos /></ProtectedRoute>} />
            <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
            <Route path="/chamados" element={<ProtectedRoute><Chamados /></ProtectedRoute>} />
            <Route path="/chamados/novo" element={<ProtectedRoute><NovoChamado /></ProtectedRoute>} />
            <Route path="/chamados/:id" element={<ProtectedRoute><Chamados /></ProtectedRoute>} />
            <Route path="/equipamentos" element={<ProtectedRoute><Equipamentos /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
            <Route path="/perfil/contrato" element={<ProtectedRoute><Contrato /></ProtectedRoute>} />
            <Route path="/perfil/empresa" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
            <Route path="/perfil/notificacoes" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
            <Route path="/perfil/configuracoes" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
            <Route path="/ajuda" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
            
            {/* Área Técnica */}
            <Route path="/tecnico" element={<ProtectedRoute><TecnicoDashboard /></ProtectedRoute>} />
            <Route path="/tecnico/rotas" element={<ProtectedRoute><TecnicoRotas /></ProtectedRoute>} />
            <Route path="/tecnico/ordem/:id" element={<ProtectedRoute><OrdemServico /></ProtectedRoute>} />
            <Route path="/tecnico/ordem/:id/assinatura" element={<ProtectedRoute><AssinaturaDigital /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
