import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { normalizeBriefingPayload } from "@/components/briefing/briefingSchemas";
import jsPDF from "jspdf";

interface BriefingDisplayProps {
  responses: unknown;
  category?: string | null;
  productName?: string;
}

const BriefingDisplay = ({ responses, category, productName }: BriefingDisplayProps) => {
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`Briefing - ${productName || "Produto"}`, margin, y);
    y += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(`Atualizado em ${new Date(normalized.saved_at).toLocaleString("pt-BR")}`, margin, y);
    y += 12;
    doc.setTextColor(0);

    filledFields.forEach((field) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(field.label.toUpperCase(), margin, y);
      y += 6;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(field.value, maxWidth);
      lines.forEach((line: string) => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(line, margin, y);
        y += 5;
      });
      y += 6;
    });

    doc.save(`briefing-${(productName || "produto").toLowerCase().replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <Card className="hub-card-shadow">
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Briefing preenchido</Badge>
          <p className="text-xs text-muted-foreground">
            Atualizado em {new Date(normalized.saved_at).toLocaleString("pt-BR")}
          </p>
          <Button variant="outline" size="sm" className="ml-auto gap-2" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4" /> Baixar PDF
          </Button>
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
