import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Code2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmbedReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  currentHtml?: string | null;
  onUpdated?: () => void;
}

const EmbedReportDialog = ({ open, onOpenChange, clientId, clientName, currentHtml, onUpdated }: EmbedReportDialogProps) => {
  const { toast } = useToast();
  const [html, setHtml] = useState(currentHtml || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await (supabase as any)
      .from("clients")
      .update({ report_html: html || null })
      .eq("id", clientId);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Relatório atualizado com sucesso!" });
      onUpdated?.();
      onOpenChange(false);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Incorporar HTML de Relatório
          </DialogTitle>
          <DialogDescription>
            Cole o código HTML/iframe do Reportei para o cliente <strong>{clientName}</strong>.
            O relatório aparecerá automaticamente na conta do cliente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label htmlFor="report-html">Código HTML do Relatório</Label>
          <Textarea
            id="report-html"
            placeholder='<iframe title="report" src="https://app.reportei.com/embed/..." width="500" height="300"></iframe>'
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={5}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Cole o iframe completo fornecido pelo Reportei ou outro serviço de relatórios.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Relatório"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmbedReportDialog;
