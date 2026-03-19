import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Upload, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

interface Revision {
  id: string;
  action: string;
  actor_name: string | null;
  comment: string | null;
  created_at: string;
}

interface CreativeTimelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creativeId: string;
  creativeCode: string;
}

const actionConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  uploaded: { icon: <Upload className="h-4 w-4" />, color: "text-blue-500 bg-blue-100", label: "Enviado" },
  approved: { icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-600 bg-green-100", label: "Aprovado" },
  rejected: { icon: <XCircle className="h-4 w-4" />, color: "text-red-500 bg-red-100", label: "Rejeitado" },
  resubmitted: { icon: <RotateCcw className="h-4 w-4" />, color: "text-purple-500 bg-purple-100", label: "Reenviado" },
};

const CreativeTimelineModal = ({ open, onOpenChange, creativeId, creativeCode }: CreativeTimelineModalProps) => {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !creativeId) return;
    setLoading(true);
    (supabase as any)
      .from("creative_revisions")
      .select("*")
      .eq("creative_id", creativeId)
      .order("created_at", { ascending: true })
      .then(({ data }: { data: Revision[] | null }) => {
        setRevisions(data || []);
        setLoading(false);
      });
  }, [open, creativeId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Linha do Tempo</DialogTitle>
          <DialogDescription>{creativeCode}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : revisions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum histórico de revisão.</p>
        ) : (
          <div className="relative pl-6 space-y-0">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

            {revisions.map((rev, idx) => {
              const config = actionConfig[rev.action] || actionConfig.uploaded;
              return (
                <div key={rev.id} className="relative pb-6 last:pb-0">
                  {/* Circle */}
                  <div className={`absolute -left-6 top-0.5 h-6 w-6 rounded-full flex items-center justify-center ${config.color}`}>
                    {config.icon}
                  </div>

                  <div className="ml-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{config.label}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(rev.created_at).toLocaleDateString("pt-BR")} {new Date(rev.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {rev.actor_name && (
                      <p className="text-xs text-muted-foreground">por {rev.actor_name}</p>
                    )}
                    {rev.comment && (
                      <div className="mt-1 p-2 bg-muted rounded-md">
                        <p className="text-xs text-foreground">{rev.comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreativeTimelineModal;
