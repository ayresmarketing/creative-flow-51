import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus, FileText, Calendar, Video, MoreVertical, Pencil, Trash2, Upload,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import RoteiroDialog from "./RoteiroDialog";

interface Roteiro {
  id: string;
  title: string;
  content: string;
  is_recorded: boolean;
  video_creative_id: string | null;
  video_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

interface RoteiroListProps {
  productId: string;
  productAcronym: string;
}

const RoteiroList = ({ productId, productAcronym }: RoteiroListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoteiro, setEditingRoteiro] = useState<Roteiro | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchRoteiros = useCallback(async () => {
    const { data } = await supabase
      .from("roteiros")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    setRoteiros(data || []);
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    fetchRoteiros();
  }, [fetchRoteiros]);

  const toggleRecorded = async (roteiro: Roteiro) => {
    const { error } = await supabase
      .from("roteiros")
      .update({ is_recorded: !roteiro.is_recorded })
      .eq("id", roteiro.id);
    if (error) {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
      return;
    }
    setRoteiros((prev) =>
      prev.map((r) => (r.id === roteiro.id ? { ...r, is_recorded: !r.is_recorded } : r))
    );
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("roteiros").delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Erro ao excluir roteiro", variant: "destructive" });
    } else {
      setRoteiros((prev) => prev.filter((r) => r.id !== deleteId));
      toast({ title: "Roteiro excluído com sucesso" });
    }
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const handleSaved = () => {
    setDialogOpen(false);
    setEditingRoteiro(null);
    fetchRoteiros();
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando roteiros...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Roteiros</h2>
        <Button
          onClick={() => { setEditingRoteiro(null); setDialogOpen(true); }}
          className="gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" /> Novo Roteiro
        </Button>
      </div>

      {roteiros.length === 0 ? (
        <Card className="hub-card-shadow">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum roteiro criado</h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro roteiro para organizar as gravações dos criativos.
            </p>
            <Button onClick={() => { setEditingRoteiro(null); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Criar Primeiro Roteiro
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {roteiros.map((roteiro) => (
            <Card key={roteiro.id} className="hub-card-shadow hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">{roteiro.title}</h3>
                      {roteiro.is_recorded && (
                        <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">Gravado</Badge>
                      )}
                      {roteiro.video_sent_at && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Video className="h-3 w-3" /> Vídeo enviado
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {roteiro.content || "Sem conteúdo"}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Criado em {new Date(roteiro.created_at).toLocaleDateString("pt-BR")}
                      </span>
                      {roteiro.video_sent_at && (
                        <span className="flex items-center gap-1">
                          <Upload className="h-3 w-3" />
                          Vídeo em {new Date(roteiro.video_sent_at).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Gravado</span>
                      <Switch
                        checked={roteiro.is_recorded}
                        onCheckedChange={() => toggleRecorded(roteiro)}
                      />
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingRoteiro(roteiro); setDialogOpen(true); }}>
                          <Pencil className="h-4 w-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => { setDeleteId(roteiro.id); setDeleteOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <RoteiroDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingRoteiro(null); }}
        productId={productId}
        productAcronym={productAcronym}
        roteiro={editingRoteiro}
        onSaved={handleSaved}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir roteiro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este roteiro permanentemente? Esta ação não pode ser desfeita.
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
    </div>
  );
};

export default RoteiroList;
