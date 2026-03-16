import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import CreateProductDialog from "@/components/CreateProductDialog";
import { supabase } from "@/integrations/supabase/client";
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
  Clock,
  ArrowLeft,
  BarChart3,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  acronym: string;
  category: string;
  created_at: string;
}

const ClientProducts = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [clientName, setClientName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    if (!clientId) return;
    const { data } = await supabase
      .from("products")
      .select("id, name, acronym, category, created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    if (!clientId) return;
    // fetch client name
    supabase
      .from("clients")
      .select("name")
      .eq("id", clientId)
      .single()
      .then(({ data }) => setClientName(data?.name || ""));
    fetchProducts();
  }, [clientId, fetchProducts]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{clientName || "Cliente"}</h1>
              <p className="text-muted-foreground mt-1 text-sm">Produtos deste cliente</p>
              <Button variant="outline" size="sm" className="mt-2 gap-2" onClick={() => navigate(`/clients/${clientId}/report`)}>
                <BarChart3 className="h-4 w-4" />
                Ver Relatório
              </Button>
            </div>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="hub-shadow gap-2 self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
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
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filtered.map((product) => (
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
                    <span>Criado em {new Date(product.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <Card className="hub-card-shadow">
            <CardContent className="p-12 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Tente ajustar os filtros." : "Crie o primeiro produto para este cliente."}
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

export default ClientProducts;
