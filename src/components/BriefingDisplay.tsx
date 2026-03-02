import { Card, CardContent } from "@/components/ui/card";
import { briefingFields, type BriefingResponses } from "./BriefingForm";
import { FileText } from "lucide-react";

interface BriefingDisplayProps {
  responses: BriefingResponses | null;
}

const BriefingDisplay = ({ responses }: BriefingDisplayProps) => {
  if (!responses) {
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

  return (
    <Card className="hub-card-shadow">
      <CardContent className="p-6 space-y-6">
        {briefingFields.map((field) => {
          const value = responses[field.key];
          if (!value) return null;
          return (
            <div key={field.key} className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {field.label}
              </p>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed bg-muted/30 rounded-lg p-3">
                {value}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default BriefingDisplay;
