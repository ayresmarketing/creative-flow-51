import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import CreateGestorDialog from "@/components/CreateGestorDialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Shield, Mail } from "lucide-react";

interface GestorRecord {
  name: string;
  email: string;
  user_id: string;
}

const Gestores = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [gestors, setGestors] = useState<GestorRecord[]>([]);

  const fetchGestors = useCallback(async () => {
    // Get all user_ids with gestor role, then fetch their profiles
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "gestor");
    if (!roles || roles.length === 0) { setGestors([]); return; }
    const ids = roles.map((r) => r.user_id);
    const { data: profiles } = await supabase.from("profiles").select("name, email, user_id").in("user_id", ids);
    setGestors(profiles || []);
  }, []);

  useEffect(() => {
    if (user?.role === "GESTOR") fetchGestors();
  }, [user, fetchGestors]);

  if (user?.role !== "GESTOR") {
    navigate("/products");
    return null;
  }

  return (
    <Layout>
      <CreateGestorDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={fetchGestors} />
      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestores</h1>
            <p className="text-muted-foreground mt-1">Gerencie os gestores da agência</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="hub-shadow gap-2">
            <Plus className="h-4 w-4" />
            Novo Gestor
          </Button>
        </div>

        {gestors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {gestors.map((gestor) => (
              <Card key={gestor.user_id} className="hub-card-shadow animate-fade-in">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{gestor.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{gestor.email}</p>
                        </div>
                      </div>
                    </div>
                    <Badge variant="default" className="text-xs">Gestor</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="hub-card-shadow">
            <CardContent className="p-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum gestor cadastrado</h3>
              <p className="text-muted-foreground mb-4">Comece cadastrando seu primeiro gestor.</p>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Gestor
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Gestores;
