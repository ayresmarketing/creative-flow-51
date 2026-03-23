import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const ClientReport = () => {
  const { user } = useAuth();
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.clientId) return;
    supabase
      .from("clients")
      .select("report_html")
      .eq("id", user.clientId)
      .maybeSingle()
      .then(({ data }: { data: any }) => {
        setReportHtml(data?.report_html || null);
        setLoading(false);
      });
  }, [user?.clientId]);

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
        <div className="p-4 md:p-8 flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Relatório não disponível</h3>
              <p className="text-muted-foreground">
                O relatório de campanhas ainda não foi configurado. Entre em contato com seu gestor.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Extract src from iframe HTML if it's an iframe tag
  const srcMatch = reportHtml.match(/src="([^"]+)"/);
  const iframeSrc = srcMatch ? srcMatch[1] : null;

  return (
    <Layout>
      <div className="p-2 md:p-4">
        <div className="mb-4 md:mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Relatório</h1>
          <p className="text-muted-foreground text-sm mt-1">Acompanhe o desempenho das suas campanhas</p>
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

export default ClientReport;
