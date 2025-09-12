import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  FolderOpen, 
  BarChart3, 
  Settings, 
  LogOut,
  User,
  Crown
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const mockUser = {
  name: "João Silva",
  email: "joao@ayresmarketing.com",
  role: "GESTOR" as const, // or "CLIENTE"
  company: "Ayres Marketing",
  avatar: "/placeholder.svg"
};

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Produtos",
      href: "/products",
      icon: FolderOpen,
    },
    {
      name: "Relatórios",
      href: "/reports",
      icon: BarChart3,
    },
    {
      name: "Configurações",
      href: "/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
            <div className="w-8 h-8 hub-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AH</span>
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Ayres Hub</h1>
              <p className="text-xs text-muted-foreground">Creative Management</p>
            </div>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {mockUser.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={mockUser.role === "GESTOR" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {mockUser.role === "GESTOR" && <Crown className="h-3 w-3 mr-1" />}
                    {mockUser.role}
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
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;