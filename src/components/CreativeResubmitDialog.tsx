import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, RefreshCw } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface CreativeResubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creativeId: string;
  creativeCode: string;
  formats: string[];
  onResubmitted?: () => void;
}

const CreativeResubmitDialog = ({
  open, onOpenChange, creativeId, creativeCode, formats, onResubmitted,
}: CreativeResubmitDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedFile, setFeedFile] = useState<File | null>(null);
  const [storiesFile, setStoriesFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const hasFeed = formats.includes("Feed");
  const hasStories = formats.includes("Stories");

  const handleSubmit = async () => {
    if (hasFeed && !feedFile && hasStories && !storiesFile) {
      toast({ title: "Selecione pelo menos um arquivo", variant: "destructive" });
      return;
    }
    if (hasFeed && !hasStories && !feedFile) {
      toast({ title: "Selecione o arquivo Feed", variant: "destructive" });
      return;
    }
    if (hasStories && !hasFeed && !storiesFile) {
      toast({ title: "Selecione o arquivo Stories", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      // Delete old files from storage and DB
      const { data: oldFiles } = await supabase
        .from("creative_files")
        .select("id, file_path, format")
        .eq("creative_id", creativeId);

      const filesToReplace: string[] = [];
      if (feedFile) filesToReplace.push("Feed");
      if (storiesFile) filesToReplace.push("Stories");

      for (const old of (oldFiles || [])) {
        if (filesToReplace.includes(old.format)) {
          await supabase.storage.from("creatives").remove([old.file_path]);
          await supabase.from("creative_files").delete().eq("id", old.id);
        }
      }

      // Upload new files
      const uploads: { file: File; format: string }[] = [];
      if (feedFile) uploads.push({ file: feedFile, format: "Feed" });
      if (storiesFile) uploads.push({ file: storiesFile, format: "Stories" });

      for (let i = 0; i < uploads.length; i++) {
        const { file, format } = uploads[i];
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${creativeId}/${format.toLowerCase()}_${Date.now()}.${ext}`;

        await supabase.storage.from("creatives").upload(path, file);
        await supabase.from("creative_files").insert({
          creative_id: creativeId,
          file_path: path,
          file_name: file.name,
          format,
          file_size: file.size,
          position: i,
        });
      }

      // Update creative status
      await supabase.from("creatives").update({
        approval_status: "pending",
        rejection_reason: null,
      }).eq("id", creativeId);

      // Add revision
      await supabase.from("creative_revisions").insert({
        creative_id: creativeId,
        actor_id: user!.id,
        actor_name: user!.name,
        action: "Reenviado para aprovação",
        comment: `Novos arquivos: ${uploads.map(u => u.format).join(", ")}`,
      });

      toast({ title: "Criativo reenviado para aprovação!" });
      onResubmitted?.();
      onOpenChange(false);
      setFeedFile(null);
      setStoriesFile(null);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" /> Reenviar Criativo
          </DialogTitle>
          <DialogDescription>
            Selecione os novos arquivos para <strong>{creativeCode}</strong> e reenvie para aprovação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {hasFeed && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Badge variant="outline">Feed</Badge>
              </Label>
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                {feedFile ? (
                  <p className="text-sm text-foreground font-medium truncate px-4">{feedFile.name}</p>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Clique para selecionar</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => setFeedFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          )}

          {hasStories && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Badge variant="outline">Stories</Badge>
              </Label>
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                {storiesFile ? (
                  <p className="text-sm text-foreground font-medium truncate px-4">{storiesFile.name}</p>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Clique para selecionar</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => setStoriesFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {saving ? "Enviando..." : "Reenviar para aprovação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreativeResubmitDialog;
