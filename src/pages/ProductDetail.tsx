import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter,
  Image,
  Video,
  Layers,
  Download,
  Eye,
  Edit,
  MoreVertical,
  Calendar,
  Tag,
  Play,
  ArrowLeft
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data
const mockProduct = {
  id: "1",
  name: "Tênis Esportivo Pro",
  category: "Calçados",
  createdAt: "2024-01-10",
  description: "Linha premium de tênis esportivos para alta performance"
};

const mockCreatives = [
  {
    id: "1",
    code: "ADF0001",
    type: "PHOTO",
    objective: "Vendas",
    formats: ["Feed", "Stories"],
    status: "PUBLISHED",
    createdAt: "2024-01-15",
    thumbnail: "/placeholder.svg",
    publicationIds: [
      { platform: "META", id: "23849583749", note: "Campanha principal" }
    ],
    notes: "Imagem principal do produto com fundo branco"
  },
  {
    id: "2", 
    code: "ADV0001",
    type: "VIDEO",
    objective: "Conteúdo",
    formats: ["Feed", "Stories", "YouTube"],
    status: "PUBLISHED", 
    createdAt: "2024-01-14",
    thumbnail: "/placeholder.svg",
    duration: 15,
    publicationIds: [
      { platform: "META", id: "23849583750", note: "Stories principal" },
      { platform: "YOUTUBE", id: "dQw4w9WgXcQ", note: "Canal oficial" }
    ],
    notes: "Vídeo demonstrando o produto em uso"
  },
  {
    id: "3",
    code: "ADC0001", 
    type: "CAROUSEL",
    objective: "Remarketing",
    formats: ["Feed"],
    status: "PENDING",
    createdAt: "2024-01-13",
    thumbnail: "/placeholder.svg",
    imageCount: 5,
    publicationIds: [],
    notes: "Carrossel com detalhes do produto"
  }
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCreatives = mockCreatives.filter(creative => {
    const matchesSearch = creative.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const stats = {
    total: mockCreatives.length,
    photos: mockCreatives.filter(c => c.type === "PHOTO").length,
    videos: mockCreatives.filter(c => c.type === "VIDEO").length,
    carousels: mockCreatives.filter(c => c.type === "CAROUSEL").length,
    published: mockCreatives.filter(c => c.status === "PUBLISHED").length,
    pending: mockCreatives.filter(c => c.status === "PENDING").length
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{mockProduct.name}</h1>
            <p className="text-muted-foreground mt-1">
              {mockProduct.category} • Criado em {new Date(mockProduct.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <Button 
            onClick={() => navigate(`/products/${id}/upload`)}
            className="hub-shadow gap-2"
          >
            <Plus className="h-4 w-4" />
            Enviar Criativo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="hub-card-shadow">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="hub-card-shadow">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Image className="h-4 w-4 text-primary" />
                <p className="text-2xl font-bold text-foreground">{stats.photos}</p>
              </div>
              <p className="text-sm text-muted-foreground">Fotos</p>
            </CardContent>
          </Card>
          <Card className="hub-card-shadow">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Video className="h-4 w-4 text-success" />
                <p className="text-2xl font-bold text-foreground">{stats.videos}</p>
              </div>
              <p className="text-sm text-muted-foreground">Vídeos</p>
            </CardContent>
          </Card>
          <Card className="hub-card-shadow">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Layers className="h-4 w-4 text-warning" />
                <p className="text-2xl font-bold text-foreground">{stats.carousels}</p>
              </div>
              <p className="text-sm text-muted-foreground">Carrosséis</p>
            </CardContent>
          </Card>
          <Card className="hub-card-shadow">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">{stats.published}</p>
              <p className="text-sm text-muted-foreground">Publicados</p>
            </CardContent>
          </Card>
          <Card className="hub-card-shadow">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="hub-card-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar criativos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="photo">Fotos</SelectItem>
                    <SelectItem value="video">Vídeos</SelectItem>
                    <SelectItem value="carousel">Carrosséis</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="published">Publicados</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Creatives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCreatives.map((creative) => (
            <Card key={creative.id} className="hub-card-shadow hover:shadow-lg transition-shadow animate-fade-in">
              <CardContent className="p-0">
                {/* Thumbnail */}
                <div className="relative aspect-square bg-muted rounded-t-lg overflow-hidden">
                  <img 
                    src={creative.thumbnail} 
                    alt={creative.code}
                    className="w-full h-full object-cover"
                  />
                  {creative.type === "VIDEO" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="p-3 bg-white/90 rounded-full">
                        <Play className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  )}
                  {creative.type === "CAROUSEL" && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {creative.imageCount} imagens
                    </div>
                  )}
                  {creative.type === "VIDEO" && creative.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {creative.duration}s
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={getTypeColor(creative.type)}>
                        {getTypeIcon(creative.type)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{creative.code}</p>
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
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={creative.status === "PUBLISHED" ? "default" : "secondary"}
                    >
                      {creative.status === "PUBLISHED" ? "Publicado" : "Pendente"}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(creative.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  {/* Formats */}
                  <div className="flex flex-wrap gap-1">
                    {creative.formats.map((format) => (
                      <Badge key={format} variant="outline" className="text-xs">
                        {format}
                      </Badge>
                    ))}
                  </div>

                  {/* Publication IDs */}
                  {creative.publicationIds.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">IDs de Publicação:</p>
                      {creative.publicationIds.map((pub, index) => (
                        <div key={index} className="text-xs bg-muted p-2 rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {pub.platform}
                            </Badge>
                            <span className="font-mono">{pub.id}</span>
                          </div>
                          {pub.note && (
                            <p className="text-muted-foreground mt-1">{pub.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
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

        {/* Empty State */}
        {filteredCreatives.length === 0 && (
          <Card className="hub-card-shadow">
            <CardContent className="p-12 text-center">
              <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum criativo encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca."
                  : "Comece enviando seu primeiro criativo."}
              </p>
              {!searchTerm && typeFilter === "all" && statusFilter === "all" && (
                <Button onClick={() => navigate(`/products/${id}/upload`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Enviar Primeiro Criativo
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