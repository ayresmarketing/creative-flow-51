import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { invokeGoogleDriveOperation } from "@/lib/googleDrive";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus, Search, Image, Video, Layers, MoreVertical, Calendar,
  Play, ArrowLeft, Table as TableIcon, LayoutGrid, CheckCircle2, Circle,
  Eye, Trash2, Download, BarChart3, Clock
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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import CreativePreviewDialog from "@/components/CreativePreviewDialog";
import RoteiroList from "@/components/RoteiroList";
import ProductNotes from "@/components/ProductNotes";
import BriefingDisplay from "@/components/BriefingDisplay";
import ProductContentsTab from "@/components/ProductContentsTab";
import CreativeApprovalBadge from "@/components/CreativeApprovalBadge";
import CreativeTimeline from "@/components/CreativeTimeline";
import GoogleAdsTab from "@/components/GoogleAdsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Creative {
  id: string;
  code: string;
  type: string;
  objective: string;
  formats: string[];
  status: string;
  created_at: string;
  notes: string | null;
  thumbnail_url?: string | null;
  approval_status?: string;
  rejection_reason?: string | null;
  uploaded_by?: string | null;
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
  const [activeTab, setActiveTab] = useState("criativos");
  const [briefingData, setBriefingData] = useState<unknown>(null);

  // Preview dialog
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewCreative, setPreviewCreative] = useState<Creative | null>(null);
  const [previewFormatFilter, setPreviewFormatFilter] = useState<string | undefined>(undefined);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteCreativeId, setDeleteCreativeId] = useState<string | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [timelineCreative, setTimelineCreative] = useState<Creative | null>(null);
  const [isCollaborator, setIsCollaborator] = useState(false);

  useEffect(() => {
    if (!user?.id || user.role !== "CLIENTE") return;
    supabase
      .from("client_team_members")
      .select("team_role")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.team_role === "colaborador") setIsCollaborator(true);
      });
  }, [user?.id, user?.role]);

  const objectiveCategories = ["Todos", "Vendas", "Conteúdo", "Lembrete", "Remarketing", "Captação", "Carrinho Aberto", "Outro"];

  const fetchData = useCallback(async () => {
    if (!id) return;
    const [prodRes, creatRes, briefRes] = await Promise.all([
      supabase.from("products").select("*").eq("id", id).single(),
      supabase.from("creatives").select("*").eq("product_id", id).order("created_at", { ascending: false }),
      (supabase.from("product_briefings") as any)
        .select("responses, updated_at")
        .eq("product_id", id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    setProduct(prodRes.data);
    setBriefingData(briefRes.data?.responses ?? null);

    // Fetch thumbnails for each creative
    const creativesData = creatRes.data || [];
    const creativesWithThumbs = await Promise.all(
      creativesData.map(async (c) => {
        const { data: files } = await supabase
          .from("creative_files")
          .select("file_path")
          .eq("creative_id", c.id)
          .order("position")
          .limit(1);
        let thumbnail_url: string | null = null;
        if (files && files.length > 0) {
          const { data } = await supabase.storage.from("creatives").createSignedUrl(files[0].file_path, 3600);
          thumbnail_url = data?.signedUrl ?? null;
        }
        return { ...c, thumbnail_url };
      })
    );
    setCreatives(creativesWithThumbs);
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

  const handleDelete = async () => {
    if (!deleteCreativeId) return;
    const creativeToDelete = creatives.find((creative) => creative.id === deleteCreativeId);
    if (!creativeToDelete || !id) return;

    try {
      await invokeGoogleDriveOperation({
        action: "delete_creative",
        productId: id,
        creativeType: creativeToDelete.type,
        objective: creativeToDelete.objective,
        creativeCode: creativeToDelete.code,
      });
    } catch (driveError: any) {
      toast({
        title: "Erro ao excluir no Google Drive",
        description: driveError?.message || "Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    const { data: files } = await supabase
      .from("creative_files")
      .select("file_path")
      .eq("creative_id", deleteCreativeId);

    if (files && files.length > 0) {
      await supabase.storage.from("creatives").remove(files.map(f => f.file_path));
    }

    await supabase.from("creative_files").delete().eq("creative_id", deleteCreativeId);
    const { error } = await supabase.from("creatives").delete().eq("id", deleteCreativeId);
    if (error) {
      toast({ title: "Erro ao excluir criativo", variant: "destructive" });
    } else {
      setCreatives(prev => prev.filter(c => c.id !== deleteCreativeId));
      toast({ title: "Criativo excluído com sucesso" });
    }
    setDeleteOpen(false);
    setDeleteCreativeId(null);
  };

  const handleDownload = async (creative: Creative) => {
    const { data: files } = await supabase
      .from("creative_files")
      .select("file_path, file_name")
      .eq("creative_id", creative.id)
      .order("position");

    if (!files || files.length === 0) {
      toast({ title: "Nenhum arquivo encontrado", variant: "destructive" });
      return;
    }

    for (const file of files) {
      const { data } = await supabase.storage.from("creatives").createSignedUrl(file.file_path, 3600);
      if (!data?.signedUrl) continue;
      try {
        const response = await fetch(data.signedUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.file_name || "creative-file";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {
        window.open(data.signedUrl, "_blank");
      }
    }
  };

  const openPreviewWithFormat = (creative: Creative, format?: string) => {
    setPreviewCreative(creative);
    setPreviewFormatFilter(format);
    setPreviewOpen(true);
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

  const hasBothFormats = (creative: Creative) =>
    creative.formats.includes("Feed") && creative.formats.includes("Stories");

  const CreativeDropdownMenu = ({ creative, overlay }: { creative: Creative; overlay?: boolean }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`h-7 w-7 p-0 shrink-0 ${overlay ? "bg-white text-foreground hover:bg-white/90 rounded-full shadow-md" : ""}`}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {hasBothFormats(creative) ? (
          <>
            <DropdownMenuItem onClick={() => openPreviewWithFormat(creative, "Feed")}>
              <Eye className="h-4 w-4 mr-2" /> Visualizar Feed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openPreviewWithFormat(creative, "Stories")}>
              <Eye className="h-4 w-4 mr-2" /> Visualizar Stories
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={() => openPreviewWithFormat(creative)}>
            <Eye className="h-4 w-4 mr-2" /> Pré-visualizar
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleDownload(creative)}>
          <Download className="h-4 w-4 mr-2" /> Baixar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setTimelineCreative(creative); setTimelineOpen(true); }}>
          <Clock className="h-4 w-4 mr-2" /> Linha do Tempo
        </DropdownMenuItem>
        {user?.role === "GESTOR" && (
          <>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => { setDeleteCreativeId(creative.id); setDeleteOpen(true); }}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Excluir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleStatus(creative.id, creative.status)}>
              {creative.status === "PUBLISHED" ? "Marcar como Pendente" : "Marcar como Publicado"}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (loading) {
    return <Layout><div className="p-8 text-center text-muted-foreground">Carregando...</div></Layout>;
  }

  if (!product) {
    return <Layout><div className="p-8 text-center text-muted-foreground">Produto não encontrado.</div></Layout>;
  }

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 self-start">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{product.name}</h1>
              <Badge variant="outline" className="font-mono text-base px-3 py-1">{product.acronym}</Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {product.category} • Criado em {new Date(product.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <Button onClick={() => navigate(`/products/${id}/upload`)} className="hub-shadow gap-2 self-start sm:self-auto">
            <Plus className="h-4 w-4" /> Enviar Criativo
          </Button>
        </div>

        {/* Last published per objective - Gestor only */}
        {user?.role === "GESTOR" && (() => {
          const publishedByObjective = creatives
            .filter(c => c.status === "PUBLISHED")
            .reduce<Record<string, Creative>>((acc, c) => {
              if (!acc[c.objective]) acc[c.objective] = c;
              return acc;
            }, {});
          const entries = Object.entries(publishedByObjective);
          if (entries.length === 0) return null;
          return (
            <Card className="hub-card-shadow">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Último publicado por objetivo</p>
                <div className="flex flex-wrap gap-3">
                  {entries.map(([objective, creative]) => (
                    <div key={objective} className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-1.5">
                      <span className="text-xs text-muted-foreground">{objective}:</span>
                      <span className="text-xs font-mono font-semibold text-foreground">{creative.code}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })()}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="criativos">Criativos</TabsTrigger>
            <TabsTrigger value="roteiros">Roteiros</TabsTrigger>
            <TabsTrigger value="briefing">Briefing</TabsTrigger>
            <TabsTrigger value="conteudos">Conteúdos</TabsTrigger>
            {user?.role === "GESTOR" && <TabsTrigger value="notas">Notas</TabsTrigger>}
          </TabsList>

          {/* Google Ads separate highlight bar */}
          <div className="mt-3">
            <button
              onClick={() => setActiveTab("googleads")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                activeTab === "googleads"
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              <Megaphone className="h-4 w-4" />
              Google Ads
            </button>
          </div>

          <TabsContent value="criativos" className="space-y-6 mt-4">
            {/* Creative Stats Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="hub-card-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{creatives.length}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hub-card-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{creatives.filter(c => c.status === "PUBLISHED").length}</p>
                    <p className="text-xs text-muted-foreground">Publicados</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hub-card-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{creatives.filter(c => c.status === "PENDING").length}</p>
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hub-card-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{new Set(creatives.map(c => c.objective)).size}</p>
                    <p className="text-xs text-muted-foreground">Objetivos</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="hub-card-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar criativos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-28"><SelectValue placeholder="Tipo" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="photo">Fotos</SelectItem>
                        <SelectItem value="video">Vídeos</SelectItem>
                        <SelectItem value="carousel">Carrosséis</SelectItem>
                      </SelectContent>
                    </Select>
                    {user?.role === "GESTOR" && (
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-28"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="published">Publicados</SelectItem>
                          <SelectItem value="pending">Pendentes</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
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
              <Card className="hub-card-shadow overflow-x-auto">
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
                        <TableHead className="text-right">Ações</TableHead>
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
                          <TableCell className="text-right">
                            <CreativeDropdownMenu creative={creative} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* GRID VIEW */}
            {viewMode === "grid" && filteredCreatives.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredCreatives.map((creative) => (
                  <Card
                    key={creative.id}
                    className="hub-card-shadow hover:shadow-md transition-shadow animate-fade-in overflow-hidden cursor-pointer group"
                    onClick={() => openPreviewWithFormat(creative)}
                  >
                    <CardContent className="p-0">
                      {/* Thumbnail */}
                      <div className="relative h-24 bg-muted flex items-center justify-center overflow-hidden">
                        {creative.thumbnail_url ? (
                          <>
                            {creative.type === "VIDEO" ? (
                              <>
                                <video
                                  src={creative.thumbnail_url}
                                  className="w-full h-full object-cover"
                                  muted
                                  preload="metadata"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <Play className="h-5 w-5 text-white fill-white" />
                                </div>
                              </>
                            ) : (
                              <img
                                src={creative.thumbnail_url}
                                alt={creative.code}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </>
                        ) : (
                          <span className={`${getTypeColor(creative.type)} opacity-40`}>
                            {creative.type === "VIDEO" ? <Play className="h-5 w-5" /> : getTypeIcon(creative.type)}
                          </span>
                        )}
                        {/* Dropdown always visible */}
                        <div
                          className="absolute top-1.5 right-1.5 z-20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CreativeDropdownMenu creative={creative} overlay />
                        </div>
                      </div>

                      <div className="p-2.5 space-y-1.5">
                        <p className="font-sans text-xs font-semibold text-foreground truncate leading-tight">{creative.code}</p>
                        <p className="text-[11px] text-muted-foreground leading-tight">{creative.objective}</p>

                        <div className="flex flex-wrap gap-1">
                          {creative.formats.map((format) => (
                            <Badge key={format} variant="outline" className="text-[10px] px-1.5 py-0">{format}</Badge>
                          ))}
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 ml-auto">
                            <Calendar className="h-2.5 w-2.5" />
                            {new Date(creative.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>

                        {/* Publish button */}
                        {user?.role === "GESTOR" ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleStatus(creative.id, creative.status); }}
                            className="w-full mt-1 py-1.5 px-3 rounded-md text-[11px] font-medium transition-colors border cursor-pointer flex items-center justify-center gap-1.5
                              ${creative.status === 'PUBLISHED' 
                                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' 
                                : 'bg-muted border-border text-muted-foreground hover:bg-accent'}"
                          >
                            {creative.status === "PUBLISHED" ? (
                              <><CheckCircle2 className="h-3 w-3" /> Publicado</>
                            ) : (
                              <><Circle className="h-3 w-3" /> Publicar</>
                            )}
                          </button>
                        ) : (
                          <div className={`w-full mt-1 py-1.5 px-3 rounded-md text-[11px] font-medium text-center border
                            ${creative.status === 'PUBLISHED' 
                              ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' 
                              : 'bg-muted border-border text-muted-foreground'}`}>
                            {creative.status === "PUBLISHED" ? "Publicado" : "Pendente"}
                          </div>
                        )}

                        {/* Approval section */}
                        {creative.approval_status && creative.approval_status !== "none" && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <CreativeApprovalBadge
                              creativeId={creative.id}
                              creativeCode={creative.code}
                              approvalStatus={creative.approval_status}
                              isCollaborator={isCollaborator}
                              formats={creative.formats}
                              onStatusChanged={(s) => setCreatives(prev => prev.map(c => c.id === creative.id ? { ...c, approval_status: s } : c))}
                              onResubmit={() => fetchData()}
                            />
                          </div>
                        )}
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
          </TabsContent>

          <TabsContent value="roteiros" className="mt-4">
            {product && <RoteiroList productId={product.id} productAcronym={product.acronym} />}
          </TabsContent>

          <TabsContent value="briefing" className="mt-4">
            <BriefingDisplay responses={briefingData} category={product.category} productName={product.name} productId={product.id} onBriefingSaved={fetchData} />
          </TabsContent>

          <TabsContent value="conteudos" className="mt-4">
            {product && <ProductContentsTab productId={product.id} />}
          </TabsContent>

          <TabsContent value="googleads" className="mt-4">
            {product && <GoogleAdsTab productId={product.id} />}
          </TabsContent>

          {user?.role === "GESTOR" && (
            <TabsContent value="notas" className="mt-4">
              {product && <ProductNotes productId={product.id} />}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Preview Dialog */}
      {previewCreative && (
        <CreativePreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          creativeId={previewCreative.id}
          creativeCode={previewCreative.code}
          creativeType={previewCreative.type}
          formatFilter={previewFormatFilter}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir criativo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este criativo permanentemente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Creative Timeline */}
      {timelineCreative && (
        <CreativeTimeline
          open={timelineOpen}
          onOpenChange={setTimelineOpen}
          creativeId={timelineCreative.id}
          creativeCode={timelineCreative.code}
        />
      )}
    </Layout>
  );
};

export default ProductDetail;