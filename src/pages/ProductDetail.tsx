import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus, Search, Image, Video, Layers, MoreVertical, Calendar,
  Play, ArrowLeft, Table as TableIcon, LayoutGrid, CheckCircle2, Circle
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface Creative {
  id: string;
  code: string;
  type: string;
  objective: string;
  formats: string[];
  status: string;
  created_at: string;
  notes: string | null;
}

interface ProductData {
  id: string;
  name: string;
  acronym: string;
  category: string;
  created_at: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [objectiveTab, setObjectiveTab] = useState("Todos");

  const objectiveCategories = ["Todos", "Vendas", "Conteúdo", "Lembrete", "Remarketing", "Captação", "Carrinho Aberto", "Outro"];

  const fetchData = useCallback(async () => {
    if (!id) return;
    const [prodRes, creatRes] = await Promise.all([
      supabase.from("products").select("*").eq("id", id).single(),
      supabase.from("creatives").select("*").eq("product_id", id).order("created_at", { ascending: false }),
    ]);
    setProduct(prodRes.data);
    setCreatives(creatRes.data || []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleStatus = async (creativeId: string, currentStatus: string) => {
    const newStatus = currentStatus === "PUBLISHED" ? "PENDING" : "PUBLISHED";
    const { error } = await supabase.from("creatives").update({ status: newStatus }).eq("id", creativeId);
    if (error) {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
      return;
    }
    setCreatives(prev => prev.map(c => c.id === creativeId ? { ...c, status: newStatus } : c));
  };

  const getObjectiveCount = (obj: string) => {
    if (obj === "Todos") return creatives.length;
    return creatives.filter((c) => c.objective === obj).length;
  };

  const filteredCreatives = creatives.filter((creative) => {
    const matchesSearch = creative.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creative.objective.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || creative.type.toLowerCase() === typeFilter;
    const matchesStatus = statusFilter === "all" || creative.status.toLowerCase() === statusFilter;
    const matchesObjective = objectiveTab === "Todos" || creative.objective === objectiveTab;
    return matchesSearch && matchesType && matchesStatus && matchesObjective;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PHOTO": return <Image className="h-4 w-4" />;
      case "VIDEO": return <Video className="h-4 w-4" />;
      case "CAROUSEL": return <Layers className="h-4 w-4" />;
      default: return <Image className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "PHOTO": return "text-primary";
      case "VIDEO": return "text-green-600";
      case "CAROUSEL": return "text-amber-600";
      default: return "text-primary";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "PHOTO": return "Foto";
      case "VIDEO": return "Vídeo";
      case "CAROUSEL": return "Carrossel";
      default: return type;
    }
  };

  if (loading) {
    return <Layout><div className="p-8 text-center text-muted-foreground">Carregando...</div></Layout>;
  }

  if (!product) {
    return <Layout><div className="p-8 text-center text-muted-foreground">Produto não encontrado.</div></Layout>;
  }

  return (
    <Layout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
              <Badge variant="outline" className="font-mono text-base px-3 py-1">
                {product.acronym}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {product.category} • Criado em {new Date(product.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <Button onClick={() => navigate(`/products/${id}/upload`)} className="hub-shadow gap-2">
            <Plus className="h-4 w-4" /> Enviar Criativo
          </Button>
        </div>

        {/* Filters */}
        <Card className="hub-card-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar criativos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-28"><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="photo">Fotos</SelectItem>
                    <SelectItem value="video">Vídeos</SelectItem>
                    <SelectItem value="carousel">Carrosséis</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-28"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="published">Publicados</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border rounded-md">
                  <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="rounded-r-none h-9 w-9" onClick={() => setViewMode("grid")}>
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button variant={viewMode === "table" ? "default" : "ghost"} size="icon" className="rounded-l-none h-9 w-9" onClick={() => setViewMode("table")}>
                    <TableIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Objective Tabs */}
        <div className="overflow-x-auto">
          <div className="inline-flex flex-wrap gap-1">
            {objectiveCategories.map((obj) => {
              const count = getObjectiveCount(obj);
              return (
                <button
                  key={obj}
                  onClick={() => setObjectiveTab(obj)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    objectiveTab === obj
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {obj}
                  {count > 0 && (
                    <Badge variant={objectiveTab === obj ? "secondary" : "outline"} className="text-xs px-1.5 py-0 min-w-[18px] justify-center">
                      {count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TABLE VIEW */}
        {viewMode === "table" && filteredCreatives.length > 0 && (
          <Card className="hub-card-shadow">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomenclatura</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Objetivo</TableHead>
                    <TableHead>Formatos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    {user?.role === "GESTOR" && <TableHead className="text-right">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCreatives.map((creative) => (
                    <TableRow key={creative.id}>
                      <TableCell className="font-mono font-semibold text-primary text-sm">{creative.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className={getTypeColor(creative.type)}>{getTypeIcon(creative.type)}</span>
                          <span className="text-sm">{getTypeLabel(creative.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{creative.objective}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {creative.formats.map((f) => (
                            <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user?.role === "GESTOR" ? (
                          <button
                            onClick={() => toggleStatus(creative.id, creative.status)}
                            className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            {creative.status === "PUBLISHED" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-amber-500" />
                            )}
                            <Badge variant={creative.status === "PUBLISHED" ? "default" : "secondary"} className="text-xs">
                              {creative.status === "PUBLISHED" ? "Publicado" : "Pendente"}
                            </Badge>
                          </button>
                        ) : (
                          <Badge variant={creative.status === "PUBLISHED" ? "default" : "secondary"} className="text-xs">
                            {creative.status === "PUBLISHED" ? "Publicado" : "Pendente"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(creative.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      {user?.role === "GESTOR" && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toggleStatus(creative.id, creative.status)}>
                                {creative.status === "PUBLISHED" ? "Marcar como Pendente" : "Marcar como Publicado"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* GRID VIEW */}
        {viewMode === "grid" && filteredCreatives.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredCreatives.map((creative) => (
              <Card key={creative.id} className="hub-card-shadow hover:shadow-md transition-shadow animate-fade-in overflow-hidden">
                <CardContent className="p-0">
                  {/* Small thumbnail area */}
                  <div className="relative h-28 bg-muted flex items-center justify-center">
                    <span className={getTypeColor(creative.type)}>
                      {creative.type === "VIDEO" ? <Play className="h-6 w-6" /> : getTypeIcon(creative.type)}
                    </span>
                  </div>

                  <div className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs font-semibold text-foreground truncate">{creative.code}</p>
                        <p className="text-xs text-muted-foreground">{creative.objective}</p>
                      </div>
                      {user?.role === "GESTOR" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleStatus(creative.id, creative.status)}>
                              {creative.status === "PUBLISHED" ? "Marcar como Pendente" : "Marcar como Publicado"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {user?.role === "GESTOR" ? (
                        <button
                          onClick={() => toggleStatus(creative.id, creative.status)}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <Badge variant={creative.status === "PUBLISHED" ? "default" : "secondary"} className="text-[10px]">
                            {creative.status === "PUBLISHED" ? "Publicado" : "Pendente"}
                          </Badge>
                        </button>
                      ) : (
                        <Badge variant={creative.status === "PUBLISHED" ? "default" : "secondary"} className="text-[10px]">
                          {creative.status === "PUBLISHED" ? "Publicado" : "Pendente"}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5" />
                        {new Date(creative.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {creative.formats.map((format) => (
                        <Badge key={format} variant="outline" className="text-[10px] px-1.5 py-0">{format}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredCreatives.length === 0 && !loading && (
          <Card className="hub-card-shadow">
            <CardContent className="p-12 text-center">
              <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum criativo encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca."
                  : "Comece enviando seu primeiro criativo."}
              </p>
              {!searchTerm && typeFilter === "all" && statusFilter === "all" && (
                <Button onClick={() => navigate(`/products/${id}/upload`)}>
                  <Plus className="h-4 w-4 mr-2" /> Enviar Primeiro Criativo
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
