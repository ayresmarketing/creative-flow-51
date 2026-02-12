import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, Search, Image, Video, Layers, Download, Eye, Edit, MoreVertical, Calendar, 
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

// Mock data
const mockProduct = {
  id: "1",
  name: "Método Viver de Piercing",
  acronym: "MVP",
  category: "Infoproduto",
  createdAt: "2024-01-10",
};

const mockCreatives = [
  {
    id: "1",
    code: "MVP | ADF001",
    type: "PHOTO",
    objective: "Vendas",
    formats: ["Feed", "Stories"],
    status: "PUBLISHED",
    createdAt: "2024-01-15",
    thumbnail: "/placeholder.svg",
    publicationIds: [{ platform: "META", id: "23849583749", note: "Campanha principal" }],
    notes: "Imagem principal do produto com fundo branco",
  },
  {
    id: "2",
    code: "MVP | ADV001",
    type: "VIDEO",
    objective: "Conteúdo",
    formats: ["Feed", "Stories"],
    status: "PUBLISHED",
    createdAt: "2024-01-14",
    thumbnail: "/placeholder.svg",
    duration: 15,
    publicationIds: [
      { platform: "META", id: "23849583750", note: "Stories principal" },
    ],
    notes: "Vídeo demonstrando o produto em uso",
  },
  {
    id: "3",
    code: "MVP | ADC001",
    type: "CAROUSEL",
    objective: "Remarketing",
    formats: ["Feed"],
    status: "PENDING",
    createdAt: "2024-01-13",
    thumbnail: "/placeholder.svg",
    imageCount: 5,
    publicationIds: [],
    notes: "Carrossel com detalhes do produto",
  },
  {
    id: "4",
    code: "MVP | ADV002",
    type: "VIDEO",
    objective: "Captação",
    formats: ["Feed"],
    status: "PENDING",
    createdAt: "2024-01-12",
    thumbnail: "/placeholder.svg",
    duration: 30,
    publicationIds: [],
    notes: "",
  },
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const filteredCreatives = mockCreatives.filter((creative) => {
    const matchesSearch =
      creative.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creative.objective.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || creative.type.toLowerCase() === typeFilter;
    const matchesStatus = statusFilter === "all" || creative.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
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
      case "VIDEO": return "text-success";
      case "CAROUSEL": return "text-warning";
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

  const stats = {
    total: mockCreatives.length,
    photos: mockCreatives.filter((c) => c.type === "PHOTO").length,
    videos: mockCreatives.filter((c) => c.type === "VIDEO").length,
    carousels: mockCreatives.filter((c) => c.type === "CAROUSEL").length,
    published: mockCreatives.filter((c) => c.status === "PUBLISHED").length,
    pending: mockCreatives.filter((c) => c.status === "PENDING").length,
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">{mockProduct.name}</h1>
              <Badge variant="outline" className="font-mono text-base px-3 py-1">
                {mockProduct.acronym}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {mockProduct.category} • Criado em{" "}
              {new Date(mockProduct.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <Button onClick={() => navigate(`/products/${id}/upload`)} className="hub-shadow gap-2">
            <Plus className="h-4 w-4" /> Enviar Criativo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: "Total", value: stats.total },
            { label: "Fotos", value: stats.photos, icon: <Image className="h-4 w-4 text-primary" /> },
            { label: "Vídeos", value: stats.videos, icon: <Video className="h-4 w-4 text-success" /> },
            { label: "Carrosséis", value: stats.carousels, icon: <Layers className="h-4 w-4 text-warning" /> },
            { label: "Publicados", value: stats.published, color: "text-success" },
            { label: "Pendentes", value: stats.pending, color: "text-warning" },
          ].map((s) => (
            <Card key={s.label} className="hub-card-shadow">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {s.icon}
                  <p className={`text-2xl font-bold ${s.color || "text-foreground"}`}>{s.value}</p>
                </div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters + View Toggle */}
        <Card className="hub-card-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar criativos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32"><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="photo">Fotos</SelectItem>
                    <SelectItem value="video">Vídeos</SelectItem>
                    <SelectItem value="carousel">Carrosséis</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="published">Publicados</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    className="rounded-r-none"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="icon"
                    className="rounded-l-none"
                    onClick={() => setViewMode("table")}
                  >
                    <TableIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TABLE VIEW */}
        {viewMode === "table" && filteredCreatives.length > 0 && (
          <Card className="hub-card-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Planilha de Criativos</CardTitle>
              <CardDescription>Acompanhe todos os criativos e seu status de publicação</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Nomenclatura</TableHead>
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
                    <TableRow key={creative.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono font-semibold text-primary">
                        {creative.code}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={getTypeColor(creative.type)}>{getTypeIcon(creative.type)}</span>
                          <span>{getTypeLabel(creative.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{creative.objective}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {creative.formats.map((f) => (
                            <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {creative.status === "PUBLISHED" ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <Circle className="h-4 w-4 text-warning" />
                          )}
                          <Badge variant={creative.status === "PUBLISHED" ? "default" : "secondary"}>
                            {creative.status === "PUBLISHED" ? "Publicado" : "Pendente"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(creative.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/creatives/${creative.id}`)}>
                              <Eye className="h-4 w-4 mr-2" /> Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Editar</DropdownMenuItem>
                            <DropdownMenuItem><Download className="h-4 w-4 mr-2" /> Download</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* GRID VIEW */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCreatives.map((creative) => (
              <Card key={creative.id} className="hub-card-shadow hover:shadow-lg transition-shadow animate-fade-in">
                <CardContent className="p-0">
                  {/* Thumbnail */}
                  <div className="relative aspect-square bg-muted rounded-t-lg overflow-hidden">
                    <img src={creative.thumbnail} alt={creative.code} className="w-full h-full object-cover" />
                    {creative.type === "VIDEO" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="p-3 bg-white/90 rounded-full">
                          <Play className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    )}
                    {creative.type === "CAROUSEL" && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {(creative as any).imageCount} imagens
                      </div>
                    )}
                    {creative.type === "VIDEO" && (creative as any).duration && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {(creative as any).duration}s
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={getTypeColor(creative.type)}>{getTypeIcon(creative.type)}</div>
                        <div>
                          <p className="font-mono font-semibold text-foreground">{creative.code}</p>
                          <p className="text-sm text-muted-foreground">{creative.objective}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/creatives/${creative.id}`)}>
                            <Eye className="h-4 w-4 mr-2" /> Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Editar</DropdownMenuItem>
                          <DropdownMenuItem><Download className="h-4 w-4 mr-2" /> Download</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant={creative.status === "PUBLISHED" ? "default" : "secondary"}>
                        {creative.status === "PUBLISHED" ? "Publicado" : "Pendente"}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(creative.createdAt).toLocaleDateString("pt-BR")}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {creative.formats.map((format) => (
                        <Badge key={format} variant="outline" className="text-xs">{format}</Badge>
                      ))}
                    </div>

                    {creative.notes && (
                      <div className="text-xs text-muted-foreground">
                        <p className="font-medium mb-1">Observações:</p>
                        <p>{creative.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredCreatives.length === 0 && (
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
