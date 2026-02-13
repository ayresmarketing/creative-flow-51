import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import CreateProductDialog from "@/components/CreateProductDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  FolderOpen,
  Image,
  Video,
  Layers,
  TrendingUp,
  Clock
} from "lucide-react";

// Mock data
const mockProducts = [
  {
    id: "1",
    name: "Tênis Esportivo Pro",
    category: "Calçados",
    creativeCount: 24,
    photos: 12,
    videos: 8,
    carousels: 4,
    lastUpload: "2024-01-15",
    clientId: "client-1"
  },
  {
    id: "2", 
    name: "Linha Premium Skincare",
    category: "Cosméticos",
    creativeCount: 18,
    photos: 10,
    videos: 6,
    carousels: 2,
    lastUpload: "2024-01-14",
    clientId: "client-1"
  },
  {
    id: "3",
    name: "Coleção Inverno 2024",
    category: "Roupas",
    creativeCount: 35,
    photos: 20,
    videos: 10,
    carousels: 5,
    lastUpload: "2024-01-12",
    clientId: "client-1"
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  // Filter products by clientId for CLIENTE users
  const visibleProducts = user?.role === "CLIENTE" 
    ? mockProducts.filter(p => p.clientId === user.clientId)
    : mockProducts;

  const filteredProducts = visibleProducts.filter(product => {
    return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           product.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalStats = {
    products: visibleProducts.length,
    creatives: visibleProducts.reduce((sum, p) => sum + p.creativeCount, 0),
  };

  return (
    <Layout>
      <CreateProductDialog open={createOpen} onOpenChange={setCreateOpen} />
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus produtos e criativos
            </p>
          </div>
          <Button 
            onClick={() => setCreateOpen(true)}
            className="hub-shadow gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hub-card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FolderOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalStats.products}</p>
                  <p className="text-sm text-muted-foreground">Produtos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hub-card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <Layers className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalStats.creatives}</p>
                  <p className="text-sm text-muted-foreground">Criativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="hub-card-shadow">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="hub-card-shadow hover:shadow-lg transition-shadow cursor-pointer animate-fade-in"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription>{product.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Creative Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Image className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">{product.photos}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Fotos</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Video className="h-4 w-4 text-success" />
                      <span className="font-semibold text-foreground">{product.videos}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Vídeos</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Layers className="h-4 w-4 text-warning" />
                      <span className="font-semibold text-foreground">{product.carousels}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Carrosséis</p>
                  </div>
                </div>

                {/* Last Upload */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Último upload: {new Date(product.lastUpload).toLocaleDateString('pt-BR')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <Card className="hub-card-shadow">
            <CardContent className="p-12 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Tente ajustar os filtros de busca."
                  : "Comece criando seu primeiro produto."}
              </p>
              {!searchTerm && (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Produto
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
