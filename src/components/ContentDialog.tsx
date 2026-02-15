import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

interface ContentData {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  support_file_path: string | null;
  support_file_name: string | null;
  position: number;
  created_at: string;
}

interface ContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingContent: ContentData | null;
}

const ContentDialog = ({ open, onOpenChange, editingContent }: ContentDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [supportFile, setSupportFile] = useState<File | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Get current max position for new items
  const { data: maxPosition } = useQuery({
    queryKey: ["contents-max-position"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contents")
        .select("position")
        .order("position", { ascending: false })
        .limit(1);
      return data && data.length > 0 ? (data[0] as any).position : -1;
    },
    enabled: open && !editingContent,
  });

  useEffect(() => {
    if (open) {
      if (editingContent) {
        setTitle(editingContent.title);
        setDescription(editingContent.description || "");
        setYoutubeUrl(editingContent.youtube_url);
        setExistingFileName(editingContent.support_file_name);
      } else {
        setTitle("");
        setDescription("");
        setYoutubeUrl("");
        setExistingFileName(null);
      }
      setSupportFile(null);
    }
  }, [open, editingContent]);

  const handleSave = async () => {
    if (!title.trim() || !youtubeUrl.trim()) {
      toast({ title: "Preencha o título e o link do YouTube", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      let filePath = editingContent?.support_file_path || null;
      let fileName = existingFileName;

      // Upload support file if new one selected
      if (supportFile) {
        // Remove old file if replacing
        if (filePath) {
          await supabase.storage.from("content-files").remove([filePath]);
        }

        const ext = supportFile.name.split(".").pop();
        const path = `support/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("content-files")
          .upload(path, supportFile);
        if (uploadError) throw uploadError;
        filePath = path;
        fileName = supportFile.name;
      }

      if (editingContent) {
        const { error } = await supabase
          .from("contents")
          .update({
            title: title.trim(),
            description: description.trim(),
            youtube_url: youtubeUrl.trim(),
            support_file_path: filePath,
            support_file_name: fileName,
          })
          .eq("id", editingContent.id);
        if (error) throw error;
        toast({ title: "Conteúdo atualizado" });
      } else {
        const { error } = await supabase.from("contents").insert({
          title: title.trim(),
          description: description.trim(),
          youtube_url: youtubeUrl.trim(),
          support_file_path: filePath,
          support_file_name: fileName,
          position: (maxPosition ?? -1) + 1,
        });
        if (error) throw error;
        toast({ title: "Conteúdo criado" });
      }

      queryClient.invalidateQueries({ queryKey: ["contents"] });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingContent ? "Editar Conteúdo" : "Novo Conteúdo"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome do conteúdo" />
          </div>

          <div>
            <Label>Link do YouTube</Label>
            <Input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do conteúdo..."
              rows={4}
            />
          </div>

          <div>
            <Label>Material de Apoio (opcional)</Label>
            {existingFileName && !supportFile && (
              <div className="flex items-center gap-2 mt-1 mb-2 text-sm text-muted-foreground">
                <span>Arquivo atual: {existingFileName}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setExistingFileName(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div className="mt-1">
              <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-md p-3 hover:bg-accent/50 transition-colors">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {supportFile ? supportFile.name : "Selecionar arquivo"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setSupportFile(e.target.files[0]);
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContentDialog;
