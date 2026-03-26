import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import CreativeResubmitDialog from "./CreativeResubmitDialog";

interface CreativeApprovalBadgeProps {
  creativeId: string;
  approvalStatus: string;
  isCollaborator?: boolean;
  formats?: string[];
  onStatusChanged?: (newStatus: string) => void;
  onResubmit?: () => void;
}

const CreativeApprovalBadge = ({
  creativeId, approvalStatus, isCollaborator = false, formats = [],
  onStatusChanged, onResubmit,
}: CreativeApprovalBadgeProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [resubmitDialogOpen, setResubmitDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewIsVideo, setPreviewIsVideo] = useState(false);

  const canApprove = user?.role === "GESTOR" || (user?.role === "CLIENTE" && !isCollaborator);

  // Fetch preview when rejection dialog opens
  useEffect(() => {
    if (!rejectionDialogOpen) return;
    (async () => {
      const { data: files } = await supabase
        .from("creative_files")
        .select("file_path, file_name")
        .eq("creative_id", creativeId)
        .order("position")
        .limit(1);
      if (files?.[0]) {
        const { data } = await supabase.storage.from("creatives").createSignedUrl(files[0].file_path, 3600);
        setPreviewUrl(data?.signedUrl ?? null);
        const ext = (files[0].file_name || files[0].file_path).split(".").pop()?.toLowerCase() || "";
        setPreviewIsVideo(["mp4", "mov", "webm", "avi"].includes(ext));
      }
    })();
  }, [rejectionDialogOpen, creativeId]);

  const updateStatus = async (status: string, reason?: string) => {
    setSaving(true);
    try {
      const updateData: any = { approval_status: status };
      if (reason) updateData.rejection_reason = reason;
      await supabase.from("creatives").update(updateData).eq("id", creativeId);
      await supabase.from("creative_revisions").insert({
        creative_id: creativeId,
        actor_id: user!.id,
        actor_name: user!.name,
        action: status === "approved" ? "Aprovado" : status === "rejected" ? "Rejeitado" : "Reenviado para aprovação",
        comment: reason || null,
      });
      onStatusChanged?.(status);
      toast({ title: status === "approved" ? "Criativo aprovado!" : status === "rejected" ? "Criativo rejeitado" : "Reenviado para aprovação" });
    } catch {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({ title: "Informe o motivo da rejeição", variant: "destructive" });
      return;
    }
    await updateStatus("rejected", rejectionReason.trim());
    setRejectionDialogOpen(false);
    setRejectionReason("");
    setPreviewUrl(null);
  };

  const statusConfig = {
    none: { color: "bg-gray-300", label: "Sem aprovação necessária" },
    pending: { color: "bg-yellow-400", label: "Aguardando aprovação" },
    approved: { color: "bg-green-500", label: "Aprovado" },
    rejected: { color: "bg-red-500", label: "Rejeitado" },
  };
  const config = statusConfig[approvalStatus as keyof typeof statusConfig] || statusConfig.none;

  return (
    <>
      <TooltipProvider>
        <div className="flex flex-col gap-1.5 w-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${config.color} shrink-0`} />
                <span className="text-[10px] text-muted-foreground">{config.label}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>{config.label}</TooltipContent>
          </Tooltip>

          {canApprove && approvalStatus === "pending" && (
            <div className="flex gap-1.5 w-full">
              <Button variant="outline" size="sm"
                className="h-7 flex-1 text-[10px] gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setRejectionDialogOpen(true)} disabled={saving}>
                <ThumbsDown className="h-3 w-3" /> Rejeitar
              </Button>
              <Button variant="outline" size="sm"
                className="h-7 flex-1 text-[10px] gap-1 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                onClick={() => updateStatus("approved")} disabled={saving}>
                <ThumbsUp className="h-3 w-3" /> Aprovar
              </Button>
            </div>
          )}

          {approvalStatus === "rejected" && (
            <Button variant="outline" size="sm"
              className="h-7 w-full text-[10px] gap-1 border-amber-200 text-amber-600 hover:bg-amber-50"
              onClick={() => setResubmitDialogOpen(true)} disabled={saving}>
              <RefreshCw className="h-3 w-3" /> Reenviar para aprovação
            </Button>
          )}
        </div>
      </TooltipProvider>

      {/* Rejection dialog with preview */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            {/* Preview side */}
            <div className="sm:w-1/2 bg-muted flex items-center justify-center min-h-[200px] sm:min-h-[350px]">
              {previewUrl ? (
                previewIsVideo ? (
                  <video src={previewUrl} className="w-full h-full object-contain max-h-[350px]" controls muted />
                ) : (
                  <img src={previewUrl} alt="Criativo" className="w-full h-full object-contain max-h-[350px]" />
                )
              ) : (
                <p className="text-muted-foreground text-sm">Carregando prévia...</p>
              )}
            </div>
            {/* Form side */}
            <div className="sm:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <DialogHeader>
                  <DialogTitle>Motivo da Rejeição</DialogTitle>
                  <DialogDescription>
                    Explique o que precisa ser alterado neste criativo.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <Textarea
                    placeholder="Descreva o que precisa ser alterado..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>Cancelar</Button>
                <Button variant="destructive" onClick={handleReject} disabled={saving}>
                  {saving ? "Enviando..." : "Rejeitar Criativo"}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resubmit dialog */}
      <CreativeResubmitDialog
        open={resubmitDialogOpen}
        onOpenChange={setResubmitDialogOpen}
        creativeId={creativeId}
        creativeCode=""
        formats={formats}
        onResubmitted={() => {
          onStatusChanged?.("pending");
          onResubmit?.();
        }}
      />
    </>
  );
};

export default CreativeApprovalBadge;
