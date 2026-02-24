import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Floating glass orb with logo */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-0 pointer-events-none">
        <div className="animate-glass-orb relative w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.8), rgba(59,130,246,0.15) 50%, rgba(59,130,246,0.05) 100%)',
            boxShadow: '0 8px 32px rgba(59,130,246,0.18), inset 0 -4px 12px rgba(255,255,255,0.6), inset 0 4px 8px rgba(255,255,255,0.4)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.5)',
          }}
        >
          <div className="absolute inset-0 rounded-full animate-orb-shine"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
            }}
          />
          <img src={ayresLogo} alt="Ayres Marketing" className="w-12 h-12 rounded-xl object-contain relative z-10" />
        </div>
      </div>

      {/* Card popup */}
      <div className="relative z-10 w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden animate-fade-in">
        {/* Header gradient band */}
        <div className="h-2 w-full bg-gradient-to-r from-primary via-[hsl(210,80%,65%)] to-primary" />

        <div className="p-8 pt-10 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Bem-vindo</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Acesse o Controle de Criativos
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
              className="w-full h-11 text-base font-semibold"
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

          <p className="text-center text-xs text-muted-foreground">
            Ayres Marketing · Controle de Criativos
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
