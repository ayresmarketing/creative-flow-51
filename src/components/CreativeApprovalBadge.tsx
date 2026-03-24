import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CreativeApprovalBadgeProps {
  creativeId: string;
  approvalStatus: string;
  onStatusChanged?: (newStatus: string) => void;
}

const CreativeApprovalBadge = ({ creativeId, approvalStatus, onStatusChanged }: CreativeApprovalBadgeProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [saving, setSaving] = useState(false);

  const isClientOwner = user?.role === "CLIENTE";

  const updateStatus = async (status: string, reason?: string) => {
    setSaving(true);
    try {
      const updateData: any = { approval_status: status };
      if (reason) updateData.rejection_reason = reason;

      await supabase.from("creatives").update(updateData).eq("id", creativeId);

      // Add revision entry
      await supabase.from("creative_revisions").insert({
        creative_id: creativeId,
        actor_id: user!.id,
        actor_name: user!.name,
        action: status === "approved" ? "Aprovado" : status === "rejected" ? "Rejeitado" : "Aguardando aprovação",
        comment: reason || null,
      });

      onStatusChanged?.(status);
      toast({ title: status === "approved" ? "Criativo aprovado!" : status === "rejected" ? "Criativo rejeitado" : "Status atualizado" });
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
  };

  const statusConfig = {
    none: { color: "bg-gray-300", label: "Sem status" },
    pending: { color: "bg-yellow-400", label: "Aguardando aprovação" },
    approved: { color: "bg-green-500", label: "Aprovado" },
    rejected: { color: "bg-red-500", label: "Rejeitado" },
  };

  const config = statusConfig[approvalStatus as keyof typeof statusConfig] || statusConfig.none;

  return (
    <>
      <TooltipProvider>
        <div className="flex items-center gap-1.5">
          {/* Status indicator */}
          <Tooltip>
            <TooltipTrigger>
              <div className={`w-3 h-3 rounded-full ${config.color} shrink-0`} />
            </TooltipTrigger>
            <TooltipContent>{config.label}</TooltipContent>
          </Tooltip>

          {/* Action buttons for client owner */}
          {isClientOwner && approvalStatus === "pending" && (
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => updateStatus("approved")}
                    disabled={saving}
                    className="w-5 h-5 rounded-full bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center"
                  >
                    <span className="text-white text-xs font-bold">✓</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Aprovar</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setRejectionDialogOpen(true)}
                    disabled={saving}
                    className="w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center"
                  >
                    <span className="text-white text-xs font-bold">✕</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Rejeitar</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </TooltipProvider>

      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Motivo da Rejeição</DialogTitle>
            <DialogDescription>
              Explique o que precisa ser alterado neste criativo para que o colaborador possa ajustá-lo.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Descreva o que precisa ser alterado..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleReject} disabled={saving}>
              {saving ? "Enviando..." : "Rejeitar Criativo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreativeApprovalBadge;
