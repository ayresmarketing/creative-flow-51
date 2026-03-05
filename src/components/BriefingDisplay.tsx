import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { normalizeBriefingPayload } from "@/components/briefing/briefingSchemas";

interface BriefingDisplayProps {
  responses: unknown;
  category?: string | null;
}

const BriefingDisplay = ({ responses, category }: BriefingDisplayProps) => {
  const normalized = normalizeBriefingPayload(responses, category);

  if (!normalized) {
    return (
      <Card className="hub-card-shadow">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              Nenhum briefing foi preenchido para este produto.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filledFields = normalized.fields.filter((field) => field.value.trim().length > 0);

  return (
    <Card className="hub-card-shadow">
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Briefing preenchido</Badge>
          <p className="text-xs text-muted-foreground">
            Atualizado em {new Date(normalized.saved_at).toLocaleString("pt-BR")}
          </p>
        </div>

        {filledFields.map((field) => (
          <div key={field.key} className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {field.label}
            </p>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed bg-muted/30 rounded-lg p-3">
              {field.value}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default BriefingDisplay;
