import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Save, Loader2 } from "lucide-react";

const Settings = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [simulatorUrl, setSimulatorUrl] = useState("");
  
  const [savingSimulator, setSavingSimulator] = useState(false);
  

  useEffect(() => {
    if (!loading && (!user || user.role !== "GESTOR")) {
      navigate(user ? "/products" : "/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    supabase
      .from("gestor_settings")
      .select("key, value")
      .eq("key", "simulator_url")
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSimulatorUrl(data.value || "");
      });
  }, []);

  const handleSave = async (key: string, value: string, setLoading: (v: boolean) => void) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("gestor_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key);
      if (error) throw error;
      toast({ title: "URL salva com sucesso!" });
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user || user.role !== "GESTOR") return null;

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">URL do Simulador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="simulator-url">Cole a URL do simulador de campanhas</Label>
            <Input
              id="simulator-url"
              placeholder="https://..."
              value={simulatorUrl}
              onChange={(e) => setSimulatorUrl(e.target.value)}
            />
            <Button
              onClick={() => handleSave("simulator_url", simulatorUrl, setSavingSimulator)}
              disabled={savingSimulator}
            >
              {savingSimulator ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar
            </Button>
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
};

export default Settings;
