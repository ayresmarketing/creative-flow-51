import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowLeft } from "lucide-react";

const GestorClientReport = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    supabase
      .from("clients")
      .select("report_html, name")
      .eq("id", clientId)
      .maybeSingle()
      .then(({ data }: { data: any }) => {
        setReportHtml(data?.report_html || null);
        setClientName(data?.name || "");
        setLoading(false);
      });
  }, [clientId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!reportHtml) {
    return (
      <Layout>
        <div className="p-4 md:p-8 space-y-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/clients/${clientId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center justify-center min-h-[40vh]">
            <Card className="max-w-md w-full">
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Relatório não configurado</h3>
                <p className="text-muted-foreground">
                  Nenhum HTML de relatório foi incorporado para {clientName || "este cliente"}.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  const srcMatch = reportHtml.match(/src="([^"]+)"/);
  const iframeSrc = srcMatch ? srcMatch[1] : null;

  return (
    <Layout>
      <div className="p-2 md:p-4">
        <div className="flex items-center gap-4 mb-4 md:mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/clients/${clientId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Relatório — {clientName}</h1>
            <p className="text-muted-foreground text-sm mt-1">Desempenho das campanhas</p>
          </div>
        </div>
        <div className="w-full rounded-xl overflow-hidden border border-border shadow-lg bg-card">
          {iframeSrc ? (
            <iframe
              title="Relatório de Campanhas"
              src={iframeSrc}
              className="w-full border-0"
              style={{ height: "calc(100vh - 180px)", minHeight: "500px" }}
              allowFullScreen
            />
          ) : (
            <div
              className="w-full"
              style={{ minHeight: "calc(100vh - 180px)" }}
              dangerouslySetInnerHTML={{ __html: reportHtml }}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GestorClientReport;
