import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, Upload, MessageSquare } from "lucide-react";

interface Revision {
  id: string;
  action: string;
  actor_name: string | null;
  comment: string | null;
  created_at: string;
}

interface CreativeTimelineProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creativeId: string;
  creativeCode: string;
}

const CreativeTimeline = ({ open, onOpenChange, creativeId, creativeCode }: CreativeTimelineProps) => {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase
      .from("creative_revisions")
      .select("*")
      .eq("creative_id", creativeId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setRevisions(data || []);
        setLoading(false);
      });
  }, [open, creativeId]);

  const getActionIcon = (action: string) => {
    if (action.includes("Aprovado")) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (action.includes("Rejeitado")) return <XCircle className="h-4 w-4 text-red-500" />;
    if (action.includes("Aguardando")) return <Clock className="h-4 w-4 text-yellow-500" />;
    if (action.includes("Enviado") || action.includes("Upload")) return <Upload className="h-4 w-4 text-primary" />;
    return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes("Aprovado")) return "bg-green-500";
    if (action.includes("Rejeitado")) return "bg-red-500";
    if (action.includes("Aguardando")) return "bg-yellow-400";
    return "bg-primary";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Linha do Tempo — {creativeCode}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-center text-sm text-muted-foreground py-8">Carregando...</p>
        ) : revisions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">Nenhuma interação registrada.</p>
        ) : (
          <div className="relative pl-6 space-y-0">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

            {revisions.map((rev, idx) => (
              <div key={rev.id} className="relative pb-6 last:pb-0">
                {/* Dot */}
                <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full ${getActionColor(rev.action)} ring-2 ring-background`} />

                <div className="ml-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getActionIcon(rev.action)}
                    <span className="text-sm font-medium">{rev.action}</span>
                    <Badge variant="outline" className="text-xs">
                      {rev.actor_name || "Sistema"}
                    </Badge>
                  </div>
                  {rev.comment && (
                    <div className="mt-1.5 p-2.5 bg-muted rounded-md">
                      <p className="text-sm text-foreground">{rev.comment}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(rev.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreativeTimeline;
