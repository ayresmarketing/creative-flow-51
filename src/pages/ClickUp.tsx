import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const ClickUp = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [url, setUrl] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "GESTOR")) {
      navigate(user ? "/products" : "/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    supabase
      .from("gestor_settings")
      .select("value")
      .eq("key", "clickup_url")
      .maybeSingle()
      .then(({ data }) => {
        setUrl(data?.value || "");
        setFetched(true);
      });
  }, []);

  if (loading || !user || user.role !== "GESTOR") return null;

  return (
    <Layout>
      <div className="h-[calc(100vh-56px)] md:h-screen w-full flex flex-col">
        {!fetched ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : url ? (
          <iframe
            src={url}
            className="flex-1 w-full border-none block"
            style={{ width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum ClickUp configurado. Acesse as Configurações para adicionar.
            </p>
            <Button variant="outline" onClick={() => navigate("/configuracoes")}>
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ClickUp;
