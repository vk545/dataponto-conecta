import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, LogIn, Wrench, Building2 } from "lucide-react";
import logo from "@/assets/logo-dataponto.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@dataponto.com.br");
  const [password, setPassword] = useState("demo123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<"cliente" | "tecnico">("cliente");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simula login para demonstração
    setTimeout(() => {
      localStorage.setItem("dataponto_auth", "true");
      localStorage.setItem("dataponto_user_type", loginType);
      
      if (loginType === "tecnico") {
        navigate("/tecnico");
      } else {
        navigate("/");
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src={logo} 
            alt="DATAPONTO" 
            className="w-20 h-20 mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground">DATAPONTO</h1>
          <p className="text-sm text-muted-foreground mt-1">Portal do Cliente</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-2">
            <h2 className="text-lg font-semibold">Bem-vindo!</h2>
            <p className="text-sm text-muted-foreground">
              Faça login para acessar sua conta
            </p>
          </CardHeader>
          <CardContent>
            {/* Login Type Tabs */}
            <Tabs value={loginType} onValueChange={(v) => setLoginType(v as "cliente" | "tecnico")} className="mb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cliente" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Cliente
                </TabsTrigger>
                <TabsTrigger value="tecnico" className="gap-2">
                  <Wrench className="h-4 w-4" />
                  Técnico
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            {/* Demo hint */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-center text-muted-foreground">
                <strong>Demonstração:</strong> Selecione o tipo de acesso e clique em "Entrar"
              </p>
              {loginType === "tecnico" && (
                <p className="text-xs text-center text-primary mt-1">
                  Você acessará a área técnica
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-6">
          © 2025 DATAPONTO. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
