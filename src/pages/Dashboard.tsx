import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import CreateProductDialog from "@/components/CreateProductDialog";
import { supabase } from "@/integrations/supabase/client";
import ayresLogo from "@/assets/ayres-logo.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  FolderOpen,
  Layers,
  Clock
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  acronym: string;
  category: string;
  created_at: string;
  client_id: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = useCallback(async () => {
    if (!user) return;

    if (user.role === "CLIENTE" && !user.clientId) {
      setProducts([]);
      return;
    }

    let query = supabase
      .from("products")
      .select("id, name, acronym, category, created_at, client_id")
      .order("created_at", { ascending: false });

    if (user.role === "CLIENTE" && user.clientId) {
      query = query.eq("client_id", user.clientId);
    }

    const { data } = await query;
    setProducts(data || []);
  }, [user]);

  useEffect(() => {
    if (!loading) {
      fetchProducts();
    }
  }, [fetchProducts, loading]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return null;
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clientId = user?.clientId || "";
  const canCreateProduct = user?.role === "CLIENTE" && !user?.isTeamMember && !!clientId;

  return (
    <Layout>
      {clientId && (
        <CreateProductDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          clientId={clientId}
          onCreated={fetchProducts}
        />
      )}
      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={ayresLogo} alt="Ayres Marketing" className="w-10 h-10 rounded-lg object-contain hidden md:block" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
              <p className="text-muted-foreground mt-1">Gerencie seus produtos e criativos</p>
            </div>
          </div>
          {canCreateProduct && (
            <Button onClick={() => setCreateOpen(true)} className="hub-shadow gap-2">
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="hub-card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FolderOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{products.length}</p>
                  <p className="text-sm text-muted-foreground">Produtos</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="hub-card-shadow hover:shadow-lg transition-shadow cursor-pointer animate-fade-in"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription>
                  {product.category} · <span className="font-mono">{product.acronym}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Criado em {new Date(product.created_at).toLocaleDateString('pt-BR')}</span>
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
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Tente ajustar os filtros de busca." : "Comece criando seu primeiro produto."}
              </p>
              {!searchTerm && canCreateProduct && (
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
