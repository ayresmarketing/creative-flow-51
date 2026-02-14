import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Upload, FileVideo, X, Check, Loader2 } from "lucide-react";

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

interface RoteiroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productAcronym: string;
  roteiro: Roteiro | null;
  onSaved: () => void;
}

const RoteiroDialog = ({ open, onOpenChange, productId, productAcronym, roteiro, onSaved }: RoteiroDialogProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(roteiro?.title || "");
      setContent(roteiro?.content || "");
      setVideoFile(null);
    }
  }, [open, roteiro]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Título é obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);

    try {
      if (roteiro) {
        // Update
        const { error } = await supabase
          .from("roteiros")
          .update({ title: title.trim(), content: content.trim() })
          .eq("id", roteiro.id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from("roteiros")
          .insert({ product_id: productId, title: title.trim(), content: content.trim() });
        if (error) throw error;
      }

      toast({ title: roteiro ? "Roteiro atualizado!" : "Roteiro criado!" });
      onSaved();
    } catch (err: any) {
      toast({ title: "Erro ao salvar roteiro", description: err?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleVideoUpload = async () => {
    if (!videoFile || !roteiro) return;
    setUploading(true);

    try {
      // Generate creative code using the same logic as CreativeUpload
      const typePrefix = "ADV";
      const { count } = await supabase
        .from("creatives")
        .select("id", { count: "exact", head: true })
        .eq("product_id", productId)
        .eq("objective", "Conteúdo")
        .eq("type", "VIDEO");

      const nextNum = (count || 0) + 1;
      const code = `${productAcronym} | Conteúdo | ${typePrefix}${nextNum.toString().padStart(3, "0")}`;

      // 1. Create creative record (same pipeline as normal upload)
      const { data: creative, error: crErr } = await supabase
        .from("creatives")
        .insert({
          code,
          type: "VIDEO",
          objective: "Conteúdo",
          formats: ["Feed"],
          product_id: productId,
          notes: `Vídeo gravado a partir do roteiro: ${roteiro.title}`,
        })
        .select("id")
        .single();

      if (crErr || !creative) throw crErr;

      // 2. Upload file to storage
      const filePath = `${productId}/${creative.id}/Feed/${Date.now()}_${videoFile.name}`;
      const { error: upErr } = await supabase.storage.from("creatives").upload(filePath, videoFile);
      if (upErr) throw upErr;

      // 3. Create creative_files record
      await supabase.from("creative_files").insert({
        creative_id: creative.id,
        file_path: filePath,
        file_name: videoFile.name,
        format: "Feed",
        position: 0,
        file_size: videoFile.size,
      });

      // 4. Update roteiro with video reference and timestamp
      await supabase
        .from("roteiros")
        .update({
          video_creative_id: creative.id,
          video_sent_at: new Date().toISOString(),
        })
        .eq("id", roteiro.id);

      toast({ title: "Vídeo enviado com sucesso!", description: `Criativo ${code} criado automaticamente.` });
      setVideoFile(null);
      onSaved();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Erro ao enviar vídeo", description: err?.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("video/")) {
      setVideoFile(files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{roteiro ? "Editar Roteiro" : "Novo Roteiro"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="roteiro-title">Título do Roteiro</Label>
            <Input
              id="roteiro-title"
              placeholder="Ex: Vídeo de apresentação do produto"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roteiro-content">Conteúdo do Roteiro</Label>
            <Textarea
              id="roteiro-content"
              placeholder="Escreva o roteiro completo para a gravação do vídeo..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="resize-y"
            />
          </div>

          {/* Video Upload Section - only for editing existing roteiros */}
          {roteiro && (
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-sm font-semibold flex items-center gap-2">
                🎥 Upload do Vídeo Gravado
              </Label>
              <p className="text-xs text-muted-foreground">
                Faça upload do vídeo gravado com base neste roteiro. Ele será registrado automaticamente como um novo criativo.
              </p>

              {roteiro.video_sent_at ? (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-3 flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      Vídeo já enviado em {new Date(roteiro.video_sent_at).toLocaleDateString("pt-BR")}
                    </span>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card
                    className={`border-2 border-dashed transition-colors cursor-pointer ${
                      isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onClick={() => document.getElementById("roteiro-video-upload")?.click()}
                  >
                    <CardContent className="p-4 text-center">
                      <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Arraste o vídeo ou clique para selecionar</p>
                      <p className="text-xs text-muted-foreground mt-1">MP4, MOV, AVI</p>
                      <input
                        type="file"
                        id="roteiro-video-upload"
                        className="hidden"
                        accept="video/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setVideoFile(e.target.files[0]);
                        }}
                      />
                    </CardContent>
                  </Card>

                  {videoFile && (
                    <Card className="p-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-100 rounded">
                          <FileVideo className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{videoFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setVideoFile(null)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  )}

                  {videoFile && (
                    <Button onClick={handleVideoUpload} disabled={uploading} className="w-full gap-2">
                      {uploading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                      ) : (
                        <><Upload className="h-4 w-4" /> Enviar Vídeo como Criativo</>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : roteiro ? "Salvar Alterações" : "Criar Roteiro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoteiroDialog;
