import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ayresLogo from "@/assets/ayres-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result) {
        navigate(result.role === "GESTOR" ? "/clients" : "/products");
      } else {
        setError("Email ou senha inválidos");
      }
    } catch {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Branding */}
      <div className="relative lg:w-[55%] min-h-[280px] lg:min-h-screen bg-gradient-to-br from-[hsl(217,91%,45%)] via-[hsl(217,91%,55%)] to-[hsl(210,80%,65%)] overflow-hidden flex items-center justify-center p-8 lg:p-16">
        {/* Decorative spheres */}
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[hsl(217,91%,35%)] opacity-60 animate-float-slow" />
        <div className="absolute top-[10%] right-[5%] w-48 h-48 rounded-full bg-[hsl(217,91%,50%)] opacity-50 animate-float-medium" />
        <div className="absolute bottom-[15%] right-[15%] w-32 h-32 rounded-full bg-[hsl(210,80%,60%)] opacity-40 animate-float-slow-reverse" />
        <div className="absolute top-[40%] left-[10%] w-20 h-20 rounded-full bg-[hsl(217,91%,70%)] opacity-30 animate-float-medium" />

        <div className="relative z-10 text-center lg:text-left max-w-lg">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl bg-white/15 backdrop-blur-xl border border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.25)] flex items-center justify-center mb-6 mx-auto lg:mx-0">
            <img
              src={ayresLogo}
              alt="Ayres Marketing"
              className="w-[85%] h-[85%] object-contain brightness-0 drop-shadow-lg"
            />
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Controle de<br />Criativos
          </h1>
          <p className="mt-4 text-white/80 text-sm lg:text-base max-w-sm">
            Gerencie seus criativos de forma organizada. Fotos, vídeos e carrosséis em um só lugar.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Entrar</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Digite suas credenciais para acessar o sistema
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? "OCULTAR" : "MOSTRAR"}
                </button>
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center animate-fade-in">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold hub-shadow"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
