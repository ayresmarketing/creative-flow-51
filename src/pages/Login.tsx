import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Crown, User } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - redirect to dashboard
    navigate("/dashboard");
  };

  // Mock accounts for demo
  const demoAccounts = [
    {
      email: "gestor@ayresmarketing.com",
      password: "123456",
      role: "GESTOR",
      name: "João Silva",
      description: "Acesso completo a todos os clientes e configurações"
    },
    {
      email: "cliente@empresa.com", 
      password: "123456",
      role: "CLIENTE",
      name: "Maria Santos",
      description: "Acesso apenas aos próprios produtos e criativos"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-success/5 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 hub-gradient rounded-2xl flex items-center justify-center mb-4 hub-shadow">
            <span className="text-white font-bold text-xl">AH</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Ayres Hub</h1>
          <p className="text-muted-foreground mt-2">Gestão de Criativos para Agências</p>
        </div>

        {/* Login Form */}
        <Card className="hub-card-shadow animate-slide-up">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full hub-shadow">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="hub-card-shadow animate-slide-up">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Contas Demo</CardTitle>
            <CardDescription>
              Clique para preencher automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoAccounts.map((account, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={account.role === "GESTOR" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {account.role === "GESTOR" && <Crown className="h-3 w-3 mr-1" />}
                      {account.role === "CLIENTE" && <User className="h-3 w-3 mr-1" />}
                      {account.role}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">
                      {account.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {account.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;