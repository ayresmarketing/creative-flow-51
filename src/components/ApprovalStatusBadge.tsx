import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ApprovalStatusBadgeProps {
  status: string; // 'none' | 'pending_approval' | 'approved' | 'rejected'
  onClick?: () => void;
  size?: "sm" | "md";
}

const statusConfig: Record<string, { color: string; label: string; ring: string }> = {
  approved: { color: "bg-green-500", label: "Aprovado", ring: "ring-green-200" },
  pending_approval: { color: "bg-amber-400", label: "Aguardando aprovação", ring: "ring-amber-200" },
  rejected: { color: "bg-red-500", label: "Rejeitado", ring: "ring-red-200" },
  none: { color: "bg-muted-foreground/30", label: "", ring: "" },
};

const ApprovalStatusBadge = ({ status, onClick, size = "sm" }: ApprovalStatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.none;
  const sizeClass = size === "md" ? "h-3.5 w-3.5" : "h-2.5 w-2.5";

  if (status === "none") return null;

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className={`inline-flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity`}
      title={config.label}
    >
      <span className={`${sizeClass} rounded-full ${config.color} ring-2 ${config.ring} inline-block shrink-0`} />
      {size === "md" && <span className="text-xs font-medium text-foreground">{config.label}</span>}
    </button>
  );
};

export default ApprovalStatusBadge;
