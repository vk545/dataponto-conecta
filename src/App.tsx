import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Treinamentos from "./pages/Treinamentos";
import Financeiro from "./pages/Financeiro";
import Chamados from "./pages/Chamados";
import NovoChamado from "./pages/NovoChamado";
import Equipamentos from "./pages/Equipamentos";
import Perfil from "./pages/Perfil";
import Contrato from "./pages/Contrato";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/treinamentos" element={<Treinamentos />} />
          <Route path="/treinamentos/agendar" element={<Treinamentos />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/chamados" element={<Chamados />} />
          <Route path="/chamados/novo" element={<NovoChamado />} />
          <Route path="/chamados/:id" element={<Chamados />} />
          <Route path="/equipamentos" element={<Equipamentos />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/perfil/contrato" element={<Contrato />} />
          <Route path="/perfil/empresa" element={<Perfil />} />
          <Route path="/perfil/notificacoes" element={<Perfil />} />
          <Route path="/perfil/configuracoes" element={<Perfil />} />
          <Route path="/ajuda" element={<Perfil />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
