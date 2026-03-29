import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { invokeGoogleDriveOperation } from "@/lib/googleDrive";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, Video, Send, Link2 } from "lucide-react";

interface Roteiro {
  id: string;
  title: string;
  content: string;
  reference_links: string[];
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
  mode: "view" | "edit" | "create";
  onSaved: () => void;
  onSendCreative?: (roteiroId: string) => void;
}

const sanitizeReferenceLinks = (rawText: string): string[] =>
  rawText
    .split("\n")
    .map((item) => item.trim())
    .filter((item, index, arr) => item.length > 0 && arr.indexOf(item) === index);

const RoteiroDialog = ({ open, onOpenChange, productId, roteiro, mode, onSaved, onSendCreative }: RoteiroDialogProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [referencesText, setReferencesText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(roteiro?.title || "");
      setContent(roteiro?.content || "");
      setReferencesText((roteiro?.reference_links || []).join("\n"));
    }
  }, [open, roteiro]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Título é obrigatório", variant: "destructive" });
      return;
    }

    const referenceLinks = sanitizeReferenceLinks(referencesText);
    setSaving(true);

    try {
      if (roteiro && mode === "edit") {
        const { error } = await supabase
          .from("roteiros")
          .update({ title: title.trim(), content: content.trim(), reference_links: referenceLinks } as any)
          .eq("id", roteiro.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("roteiros")
          .insert({
            product_id: productId,
            title: title.trim(),
            content: content.trim(),
            reference_links: referenceLinks,
          } as any);
        if (error) throw error;
      }

      await invokeGoogleDriveOperation({
        action: "upload_roteiro",
        productId,
        title: title.trim(),
        content: content.trim(),
        referenceLinks,
      });

      toast({ title: roteiro && mode === "edit" ? "Roteiro atualizado!" : "Roteiro criado!" });
      onSaved();
    } catch (err: any) {
      toast({ title: "Erro ao salvar roteiro", description: err?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (mode === "view" && roteiro) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <DialogTitle className="text-xl">{roteiro.title}</DialogTitle>
              {roteiro.is_recorded && (
                <Badge variant="default" className="text-xs">Gravado</Badge>
              )}
              {roteiro.video_sent_at && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Video className="h-3 w-3" /> Vídeo enviado
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Criado em {new Date(roteiro.created_at).toLocaleDateString("pt-BR")}
              </span>
              {roteiro.video_sent_at && (
                <span className="flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  Vídeo em {new Date(roteiro.video_sent_at).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>

            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                {roteiro.content || "Sem conteúdo."}
              </p>
            </div>

            {roteiro.reference_links?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Referências
                </p>
                <div className="space-y-2">
                  {roteiro.reference_links.map((link, index) => (
                    <a
                      key={`${link}-${index}`}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm inline-flex items-center gap-2 text-primary hover:underline break-all"
                    >
                      <Link2 className="h-4 w-4" /> {link}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {onSendCreative && !roteiro.video_sent_at && (
              <Button onClick={() => { onOpenChange(false); onSendCreative(roteiro.id); }} className="gap-2">
                <Send className="h-4 w-4" /> Enviar Criativo
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar Roteiro" : "Novo Roteiro"}</DialogTitle>
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

          <div className="space-y-2">
            <Label htmlFor="roteiro-references">Links de referência (opcional)</Label>
            <Textarea
              id="roteiro-references"
              placeholder="Cole um link por linha para usar como referência"
              value={referencesText}
              onChange={(e) => setReferencesText(e.target.value)}
              rows={4}
              className="resize-y"
            />
            <p className="text-xs text-muted-foreground">
              Você pode adicionar 1 ou várias referências, uma por linha.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : mode === "edit" ? "Salvar Alterações" : "Criar Roteiro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoteiroDialog;
