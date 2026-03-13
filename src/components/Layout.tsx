import { ReactNode, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ayresLogo from "@/assets/ayres-logo.png";
import { 
  FolderOpen, 
  Users,
  Shield,
  LogOut,
  User,
  Crown,
  BookOpen,
  Layers,
  Menu,
  X,
  BarChart3,
  UserPlus
} from "lucide-react";
import AddTeamMemberDialog from "@/components/AddTeamMemberDialog";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [clientLogoUrl, setClientLogoUrl] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.role === "CLIENTE" && user.clientId) {
      (supabase as any)
        .from("clients")
        .select("logo_url")
        .eq("id", user.clientId)
        .single()
        .then(({ data }: { data: { logo_url: string | null } | null }) => {
          if (data?.logo_url) setClientLogoUrl(data.logo_url);
        });
    }
  }, [user]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  const navigation = user?.role === "GESTOR"
    ? [
        { name: "Clientes", href: "/clients", icon: Users },
        { name: "Gestores", href: "/gestores", icon: Shield },
        { name: "Conteúdos", href: "/conteudos", icon: BookOpen },
        { name: "Swipe Files", href: "/swipe-files", icon: Layers },
      ]
    : [
        { name: "Produtos", href: "/products", icon: FolderOpen },
        { name: "Conteúdos", href: "/conteudos", icon: BookOpen },
        { name: "Swipe Files", href: "/swipe-files", icon: Layers },
        { name: "Relatório", href: "/relatorio", icon: BarChart3 },
      ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <img src={ayresLogo} alt="Ayres Marketing" className="w-8 h-8 rounded-lg object-contain" />
        <div>
          <h1 className="font-semibold text-foreground">Ayres Marketing</h1>
          <p className="text-xs text-muted-foreground">Controle de Criativos</p>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {clientLogoUrl ? (
              <AvatarImage src={clientLogoUrl} alt={user?.name} className="object-cover" />
            ) : null}
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">
              {user?.name || "Usuário"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={user?.role === "GESTOR" ? "default" : "secondary"}
                className="text-xs"
              >
                {user?.role === "GESTOR" && <Crown className="h-3 w-3 mr-1" />}
                {user?.role || "—"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.name}
              variant={isActive(item.href) ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                isActive(item.href) ? "hub-shadow" : ""
              }`}
              onClick={() => navigate(item.href)}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={ayresLogo} alt="Ayres Marketing" className="w-7 h-7 rounded-lg object-contain" />
          <span className="font-semibold text-foreground text-sm">Ayres Marketing</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50 animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col h-full pt-14">
          <NavContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border">
        <div className="flex flex-col h-full">
          <NavContent />
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 pt-14 md:pt-0">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
